"""
Recommendation engine.

Supports two modes (configured via RECOMMENDATION_ENGINE env var):
  - "gemini"  : delegates to Gemini via LangChain (AI-first, requires API key)
  - "custom"  : content-based + collaborative filtering using scikit-learn

Both modes return the same shape:
  List[{product_id, score, reason}]
"""

import json
import logging
import os
from collections import defaultdict
from datetime import datetime, timezone

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

from database.db import db
from models import Product, Recommendation, UserBehavior

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Per-store sklearn model cache (populated by build_sklearn_model)
# ---------------------------------------------------------------------------

_sklearn_cache: dict[str, dict] = {}
# Shape: { store_id: { products_indexed, vocabulary_size, avg_similarity,
#                      max_similarity, sample_terms, built_at } }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _product_text(p: Product) -> str:
    """Combine text fields into a single string for TF-IDF."""
    parts = [
        p.name or "",
        p.description or "",
        p.category or "",
        p.tags or "",
    ]
    return " ".join(parts).lower()


def _products_to_dicts(products: list[Product]) -> list[dict]:
    return [p.to_dict() for p in products]


# ---------------------------------------------------------------------------
# Custom model: content-based filtering
# ---------------------------------------------------------------------------

def _content_based_scores(source: Product, candidates: list[Product]) -> dict[int, float]:
    """TF-IDF cosine similarity between source product and candidates."""
    if not candidates:
        return {}

    all_products = [source] + candidates
    corpus = [_product_text(p) for p in all_products]

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)
    try:
        matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        return {}

    source_vec = matrix[0]
    candidate_vecs = matrix[1:]
    sims = cosine_similarity(source_vec, candidate_vecs).flatten()

    return {candidates[i].id: float(sims[i]) for i in range(len(candidates))}


# ---------------------------------------------------------------------------
# Custom model: collaborative filtering (item-based)
# ---------------------------------------------------------------------------

def _collaborative_scores(source: Product, candidates: list[Product], store_id: str) -> dict[int, float]:
    """
    Item-based collaborative filtering using co-view/co-click events.
    Finds which products are commonly viewed together in the same session.
    """
    behaviors = (
        UserBehavior.query.filter_by(store_id=store_id)
        .filter(UserBehavior.event_type.in_(["view", "click", "add_to_cart"]))
        .all()
    )

    if not behaviors:
        return {}

    # Build session → product_ids map
    session_products: dict[str, set[int]] = defaultdict(set)
    for b in behaviors:
        if b.product_id:
            session_products[b.session_id].add(b.product_id)

    # Co-occurrence count for source product
    co_counts: dict[int, int] = defaultdict(int)
    source_sessions = 0
    for prods in session_products.values():
        if source.id in prods:
            source_sessions += 1
            for pid in prods:
                if pid != source.id:
                    co_counts[pid] += 1

    if source_sessions == 0:
        return {}

    candidate_ids = {c.id for c in candidates}
    scores: dict[int, float] = {}
    for c in candidates:
        count = co_counts.get(c.id, 0)
        scores[c.id] = count / source_sessions  # normalised by source popularity

    return scores


# ---------------------------------------------------------------------------
# Custom model: popularity / trending scores
# ---------------------------------------------------------------------------

def _popularity_scores(candidates: list[Product]) -> dict[int, float]:
    """Normalise click + conversion counts into [0, 1]."""
    if not candidates:
        return {}

    raw = np.array(
        [(c.click_count or 0) + 2 * (c.conversion_count or 0) for c in candidates],
        dtype=float,
    ).reshape(-1, 1)

    if raw.max() == 0:
        return {c.id: 0.0 for c in candidates}

    scaled = MinMaxScaler().fit_transform(raw).flatten()
    return {candidates[i].id: float(scaled[i]) for i in range(len(candidates))}


# ---------------------------------------------------------------------------
# Custom engine: combines all signals
# ---------------------------------------------------------------------------

def _custom_recommendations(
    source: Product,
    candidates: list[Product],
    store_id: str,
    max_items: int,
) -> list[dict]:
    content_s = _content_based_scores(source, candidates)
    collab_s = _collaborative_scores(source, candidates, store_id)
    pop_s = _popularity_scores(candidates)

    # Weighted blend: content 50%, collaborative 30%, popularity 20%
    WEIGHTS = {"content": 0.5, "collab": 0.3, "pop": 0.2}
    final: dict[int, float] = {}
    for c in candidates:
        score = (
            WEIGHTS["content"] * content_s.get(c.id, 0)
            + WEIGHTS["collab"] * collab_s.get(c.id, 0)
            + WEIGHTS["pop"] * pop_s.get(c.id, 0)
        )
        final[c.id] = score

    ranked = sorted(final.items(), key=lambda x: x[1], reverse=True)[:max_items]

    results = []
    for pid, score in ranked:
        product = next((c for c in candidates if c.id == pid), None)
        if product:
            reason = _build_reason(product, source, content_s.get(pid, 0), collab_s.get(pid, 0))
            results.append({"product_id": pid, "score": round(score, 4), "reason": reason})

    return results


def _build_reason(product: Product, source: Product, content_score: float, collab_score: float) -> str:
    if collab_score > 0.3:
        return f"Frequently bought with {source.name}"
    if content_score > 0.5:
        return f"Similar to {source.name}"
    if product.category == source.category:
        return f"Popular in {product.category or 'this category'}"
    return "Trending in your store"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_recommendations(
    store_id: str,
    source_product_id: int,
    session_id: str = None,
    engine: str = None,
    max_items: int = None,
) -> list[dict]:
    """
    Core recommendation function. Returns list of dicts:
      [{product_id, score, reason, product: {...}}]
    Also persists result to Recommendation table.
    """
    engine = engine or os.getenv("RECOMMENDATION_ENGINE", "gemini")
    max_items = max_items or int(os.getenv("MAX_RECOMMENDATIONS", "6"))

    source = Product.query.filter_by(id=source_product_id, store_id=store_id, status="active").first()
    if not source:
        raise ValueError(f"Source product {source_product_id} not found in store {store_id}.")

    candidates = (
        Product.query.filter_by(store_id=store_id, status="active")
        .filter(Product.id != source_product_id)
        .limit(200)
        .all()
    )

    if not candidates:
        return []

    if engine == "gemini":
        try:
            from services.ai_service import get_gemini_recommendations

            # Build user context from session behavior
            user_context = []
            if session_id:
                session_behaviors = (
                    UserBehavior.query.filter_by(store_id=store_id, session_id=session_id)
                    .order_by(UserBehavior.created_at.desc())
                    .limit(10)
                    .all()
                )
                for b in session_behaviors:
                    if b.product:
                        user_context.append({"name": b.product.name, "event": b.event_type})

            raw_recs = get_gemini_recommendations(
                source_product=source.to_dict(),
                catalog=_products_to_dicts(candidates),
                user_context=user_context,
                max_items=max_items,
            )
            engine_used = "gemini"
        except Exception as exc:
            logger.warning("Gemini engine failed (%s), falling back to custom.", exc)
            raw_recs = _custom_recommendations(source, candidates, store_id, max_items)
            engine_used = "custom_fallback"
    else:
        raw_recs = _custom_recommendations(source, candidates, store_id, max_items)
        engine_used = "custom"

    # Hydrate with full product data
    id_to_product = {c.id: c for c in candidates}
    enriched = []
    for rec in raw_recs:
        pid = rec.get("product_id")
        product = id_to_product.get(pid)
        if product:
            enriched.append({**rec, "product": product.to_dict()})

    # Persist to DB
    try:
        rec_record = Recommendation(
            store_id=store_id,
            source_product_id=source_product_id,
            session_id=session_id,
            engine_used=engine_used,
            recommended_product_ids=json.dumps([r["product_id"] for r in enriched]),
            scores=json.dumps({str(r["product_id"]): r["score"] for r in enriched}),
        )
        db.session.add(rec_record)
        db.session.commit()
    except Exception as exc:
        logger.warning("Failed to persist recommendation: %s", exc)
        db.session.rollback()

    return enriched


def get_trending_recommendations(store_id: str, max_items: int = 6) -> list[dict]:
    """
    Return globally trending products (no source product context).
    Ranked by (clicks + 2*conversions) descending.
    """
    products = (
        Product.query.filter_by(store_id=store_id, status="active")
        .order_by((Product.click_count + 2 * Product.conversion_count).desc())
        .limit(max_items)
        .all()
    )
    return [{"product": p.to_dict(), "score": 1.0, "reason": "Trending in your store"} for p in products]


def build_sklearn_model(store_id: str) -> dict:
    """
    Explicitly build the TF-IDF / cosine-similarity model for a store and
    cache the result.  Returns a statistics dict that is also stored in
    _sklearn_cache[store_id] for fast retrieval by engine-info.
    """
    products = Product.query.filter_by(store_id=store_id, status="active").all()

    if not products:
        stats = {
            "status": "no_products",
            "products_indexed": 0,
            "vocabulary_size": 0,
            "avg_cosine_similarity": 0.0,
            "max_cosine_similarity": 0.0,
            "sample_terms": [],
            "built_at": datetime.now(timezone.utc).isoformat(),
        }
        _sklearn_cache[store_id] = stats
        return stats

    corpus = [_product_text(p) for p in products]

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)
    try:
        matrix = vectorizer.fit_transform(corpus)
    except ValueError as exc:
        stats = {
            "status": "error",
            "error": str(exc),
            "products_indexed": len(products),
            "vocabulary_size": 0,
        }
        _sklearn_cache[store_id] = stats
        return stats

    vocab_size = len(vectorizer.vocabulary_)

    # Cosine similarity stats (only realistic for small catalogs)
    if len(products) <= 500:
        sim_matrix = cosine_similarity(matrix)
        np.fill_diagonal(sim_matrix, 0)  # exclude self-similarity
        avg_sim = float(np.mean(sim_matrix))
        max_sim = float(np.max(sim_matrix)) if sim_matrix.size > 0 else 0.0
    else:
        avg_sim, max_sim = 0.0, 0.0  # skip for large catalogs

    # Top terms by document frequency (most widespread)
    feature_names = vectorizer.get_feature_names_out()
    doc_freq = np.asarray(matrix.sum(axis=0)).flatten()
    top_indices = doc_freq.argsort()[-50:][::-1]
    all_top_terms = [feature_names[i] for i in top_indices]
    sample_terms = all_top_terms[:15]   # display subset
    top_features = all_top_terms        # full list for export

    # Lightweight product index for export (id + name + category)
    product_index = [
        {"id": p.id, "name": p.name, "category": p.category or ""}
        for p in products
    ]

    stats = {
        "status": "built",
        "products_indexed": len(products),
        "vocabulary_size": vocab_size,
        "avg_cosine_similarity": round(avg_sim, 4),
        "max_cosine_similarity": round(max_sim, 4),
        "sample_terms": sample_terms,
        "top_features": top_features,
        "product_index": product_index,
        "built_at": datetime.now(timezone.utc).isoformat(),
    }
    _sklearn_cache[store_id] = stats
    return stats


def get_sklearn_cache(store_id: str) -> dict | None:
    """Return cached sklearn model stats for a store, or None if not built yet."""
    return _sklearn_cache.get(store_id)
