from flask import Blueprint, request, jsonify, current_app
from services.ingestion_service import ingest_csv, ingest_api, scrape_product_page, scrape_catalog_page

bp = Blueprint("ingest", __name__, url_prefix="/api/ingest")


@bp.post("/csv")
def upload_csv():
    """Upload a CSV file to populate product catalog."""
    store_id = request.form.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id form field required"}), 400

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded (field name: 'file')"}), 400

    file = request.files["file"]
    if not file.filename or not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only .csv files are accepted"}), 400

    file_bytes = file.read()
    if len(file_bytes) > current_app.config.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024):
        return jsonify({"error": "File too large (max 16 MB)"}), 413

    try:
        result = ingest_csv(store_id=store_id, file_bytes=file_bytes, filename=file.filename)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422

    return jsonify({"status": "ok", "store_id": store_id, **result}), 200


@bp.post("/api")
def ingest_from_api():
    """Fetch products from an external JSON API."""
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id")
    api_url = data.get("api_url")
    if not store_id or not api_url:
        return jsonify({"error": "store_id and api_url required"}), 400

    headers = data.get("headers", {})
    products_key = data.get("products_key")  # e.g. "products" for Shopify

    try:
        result = ingest_api(store_id=store_id, api_url=api_url, headers=headers, products_key=products_key)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422

    return jsonify({"status": "ok", "store_id": store_id, **result}), 200


@bp.post("/scrape/product")
def scrape_single():
    """Scrape a single product page URL."""
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id")
    url = data.get("url")
    if not store_id or not url:
        return jsonify({"error": "store_id and url required"}), 400

    try:
        result = scrape_product_page(store_id=store_id, url=url, extra_headers=data.get("headers"))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422

    return jsonify({"status": "ok", "store_id": store_id, **result}), 200


@bp.post("/scrape/catalog")
def scrape_catalog():
    """
    Scrape a catalog/collection page and extract multiple products.
    Optional: product_link_selector (CSS selector), max_products (int, default 50).
    """
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id")
    catalog_url = data.get("catalog_url")
    if not store_id or not catalog_url:
        return jsonify({"error": "store_id and catalog_url required"}), 400

    try:
        result = scrape_catalog_page(
            store_id=store_id,
            catalog_url=catalog_url,
            product_link_selector=data.get("product_link_selector"),
            max_products=int(data.get("max_products", 50)),
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422

    return jsonify({"status": "ok", "store_id": store_id, **result}), 200
