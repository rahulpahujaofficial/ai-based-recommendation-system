"""
Product ingestion service.
Supports three sources:
  1. CSV file upload
  2. External API (JSON feed)
  3. Web scraping via BeautifulSoup
"""

import io
import json
import logging

import pandas as pd
import requests
from bs4 import BeautifulSoup

from database.db import db
from models import Product, Store

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ensure_store(store_id: str, name: str = None, domain: str = None) -> Store:
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        store = Store(store_id=store_id, name=name or store_id, domain=domain)
        db.session.add(store)
        db.session.commit()
    return store


def _upsert_product(store_id: str, row: dict) -> Product:
    """Insert or update a product by (store_id, external_id or name)."""
    external_id = str(row.get("external_id") or row.get("id") or "").strip()
    name = str(row.get("name") or row.get("title") or "").strip()

    # Skip products without names (required field)
    if not name:
        raise ValueError(f"Product name is required but missing in: {row}")

    product = None
    if external_id:
        product = Product.query.filter_by(store_id=store_id, external_id=external_id).first()
    if not product and name:
        product = Product.query.filter_by(store_id=store_id, name=name).first()
    if not product:
        product = Product(store_id=store_id)
        db.session.add(product)

    product.external_id = external_id or product.external_id
    product.name = name  # Always set since we validated it exists
    product.description = str(row.get("description") or row.get("body_html") or "").strip() or product.description
    product.category = str(row.get("category") or row.get("product_type") or "").strip() or product.category
    product.price = _to_float(row.get("price")) or product.price
    product.image_url = str(row.get("image_url") or row.get("image") or "").strip() or product.image_url
    product.product_url = str(row.get("product_url") or row.get("url") or "").strip() or product.product_url
    tags = row.get("tags") or row.get("tag") or ""
    product.tags = str(tags).strip() if tags else product.tags
    product.rating = _to_float(row.get("rating")) or product.rating
    product.review_count = int(row.get("review_count") or row.get("reviews") or product.review_count or 0)
    product.stock = int(row.get("stock") or row.get("inventory_quantity") or product.stock or 0)
    product.status = str(row.get("status") or product.status or "active").strip()

    return product


def _to_float(val) -> float | None:
    try:
        s = str(val).replace("$", "").replace(",", "").strip()
        return float(s)
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# CSV ingestion
# ---------------------------------------------------------------------------

def ingest_csv(store_id: str, file_bytes: bytes, filename: str = "upload.csv") -> dict:
    """
    Parse a CSV file and upsert products.
    Expected columns (flexible, matched case-insensitively):
        name/title, description/body_html, category/product_type,
        price, image_url/image, product_url/url, tags, rating,
        review_count/reviews, stock/inventory_quantity, status, external_id/id
    """
    _ensure_store(store_id)

    try:
        df = pd.read_csv(io.BytesIO(file_bytes), dtype=str)
    except Exception as exc:
        raise ValueError(f"Could not parse CSV: {exc}") from exc

    # Normalise column names to lower-snake
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    df = df.where(pd.notnull(df), None)

    inserted = updated = errors = 0
    for _, row in df.iterrows():
        try:
            row_dict = row.to_dict()
            is_new = not bool(
                Product.query.filter_by(
                    store_id=store_id,
                    external_id=str(row_dict.get("external_id") or row_dict.get("id") or ""),
                ).first()
            )
            _upsert_product(store_id, row_dict)
            if is_new:
                inserted += 1
            else:
                updated += 1
        except Exception as exc:
            logger.warning("Row error: %s", exc)
            errors += 1

    db.session.commit()
    return {"inserted": inserted, "updated": updated, "errors": errors, "total_rows": len(df)}


# ---------------------------------------------------------------------------
# External API ingestion
# ---------------------------------------------------------------------------

def ingest_api(store_id: str, api_url: str, headers: dict = None, products_key: str = None) -> dict:
    """
    Fetch JSON from an external product API and upsert products.
    `products_key` is the JSON key whose value is the list of products
    (e.g. "products" for Shopify JSON feeds). If None the root value is used.
    """
    _ensure_store(store_id)

    try:
        resp = requests.get(api_url, headers=headers or {}, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        raise ValueError(f"Failed to fetch API: {exc}") from exc

    if products_key:
        items = data.get(products_key, [])
    elif isinstance(data, list):
        items = data
    else:
        # Try common wrapper keys
        for key in ("products", "items", "data", "results"):
            if key in data and isinstance(data[key], list):
                items = data[key]
                break
        else:
            items = [data]

    inserted = updated = errors = 0
    for item in items:
        try:
            # Flatten nested images (Shopify format)
            if "images" in item and isinstance(item["images"], list) and item["images"]:
                item.setdefault("image_url", item["images"][0].get("src", ""))
            is_new = not bool(
                Product.query.filter_by(
                    store_id=store_id,
                    external_id=str(item.get("id") or ""),
                ).first()
            )
            _upsert_product(store_id, item)
            if is_new:
                inserted += 1
            else:
                updated += 1
        except Exception as exc:
            logger.warning("Item error: %s", exc)
            errors += 1

    db.session.commit()
    return {"inserted": inserted, "updated": updated, "errors": errors, "total_items": len(items)}


# ---------------------------------------------------------------------------
# Web scraping ingestion
# ---------------------------------------------------------------------------

_SCRAPE_SELECTORS = {
    "name": ["h1.product-title", "h1.product__title", "h1", ".product-name", '[class*="product-name"]'],
    "price": [".price", ".product-price", '[class*="price"]', "span.money"],
    "description": [".product-description", ".description", '[class*="description"]', "p.product__description"],
    "image_url": [".product__media img", ".product-image img", "img.product-photo"],
    "category": ['.breadcrumb li:last-child', 'nav[aria-label="breadcrumb"] li:last-child'],
}


def _extract_text(soup: BeautifulSoup, selectors: list[str]) -> str:
    for sel in selectors:
        el = soup.select_one(sel)
        if el:
            return el.get_text(strip=True)
    return ""


def _extract_attr(soup: BeautifulSoup, selectors: list[str], attr: str) -> str:
    for sel in selectors:
        el = soup.select_one(sel)
        if el and el.get(attr):
            return el[attr]
    return ""


def scrape_product_page(store_id: str, url: str, extra_headers: dict = None) -> dict:
    """Scrape a single product page URL and upsert the product."""
    _ensure_store(store_id)

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        **(extra_headers or {}),
    }

    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        raise ValueError(f"Could not fetch page: {exc}") from exc

    soup = BeautifulSoup(resp.text, "lxml")

    row = {
        "name": _extract_text(soup, _SCRAPE_SELECTORS["name"]),
        "price": _extract_text(soup, _SCRAPE_SELECTORS["price"]),
        "description": _extract_text(soup, _SCRAPE_SELECTORS["description"]),
        "image_url": _extract_attr(soup, _SCRAPE_SELECTORS["image_url"], "src"),
        "category": _extract_text(soup, _SCRAPE_SELECTORS["category"]),
        "product_url": url,
    }

    if not row["name"]:
        raise ValueError("Could not detect product name from page.")

    _upsert_product(store_id, row)
    db.session.commit()
    return {"scraped": row, "url": url}


def scrape_catalog_page(store_id: str, catalog_url: str, product_link_selector: str = None, max_products: int = 50) -> dict:
    """
    Scrape a catalog / collection page, extract product URLs,
    then scrape each product page.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    try:
        resp = requests.get(catalog_url, headers=headers, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        raise ValueError(f"Could not fetch catalog: {exc}") from exc

    soup = BeautifulSoup(resp.text, "lxml")

    selector = product_link_selector or "a[href*='/products/']"
    links = soup.select(selector)

    base = resp.url.split("/collections")[0] if "/collections" in resp.url else resp.url.rstrip("/")

    seen: set[str] = set()
    product_urls: list[str] = []
    for a in links:
        href = a.get("href", "")
        if not href:
            continue
        if href.startswith("http"):
            full = href
        else:
            full = base + ("" if href.startswith("/") else "/") + href.lstrip("/")
        if full not in seen:
            seen.add(full)
            product_urls.append(full)
        if len(product_urls) >= max_products:
            break

    results = []
    for purl in product_urls:
        try:
            r = scrape_product_page(store_id, purl)
            results.append({"url": purl, "status": "ok", "name": r["scraped"].get("name")})
        except Exception as exc:
            results.append({"url": purl, "status": "error", "error": str(exc)})

    return {"catalog_url": catalog_url, "products_found": len(product_urls), "results": results}
