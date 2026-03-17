import os
from flask import Blueprint, request, jsonify, render_template
from services.widget_service import get_or_create_widget, update_widget_config, generate_embed_codes
from services.recommendation_engine import get_recommendations, get_trending_recommendations
from models import WidgetConfig

bp = Blueprint("widget", __name__)


def _config_with_base_url(config) -> dict:
    """Return config dict with widget_base_url included for client-side embed code generation."""
    result = config.to_dict()
    base_url = os.getenv("WIDGET_BASE_URL", "http://localhost:5000")
    result["widget_base_url"] = f"{base_url}/widget/{config.widget_token}"
    return result


# -----------------------------------------------------------------------
# Widget configuration API
# -----------------------------------------------------------------------

@bp.get("/api/widget/config")
def get_config():
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    config = get_or_create_widget(store_id)
    return jsonify(_config_with_base_url(config))


@bp.put("/api/widget/config")
def update_config():
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    config = update_widget_config(store_id, data)
    return jsonify(_config_with_base_url(config))


@bp.get("/api/widget/embed-codes")
def embed_codes():
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    product_id = request.args.get("product_id", type=int)
    codes = generate_embed_codes(store_id=store_id, product_id=product_id)
    return jsonify(codes)


# -----------------------------------------------------------------------
# Served widget (iframe target)
# -----------------------------------------------------------------------

@bp.get("/widget/<token>")
def serve_widget(token):
    """
    Render the embeddable HTML widget.
    All query params are optional — they override the stored config for this
    single request only (nothing is written to the DB).

      theme         dark | light
      type          carousel | grid | list
      max_items     integer
      primary_color URL-encoded hex colour (e.g. %238b5cf6)
      product_id    integer — source product for context-aware recs
      session_id    string  — visitor session for collaborative scoring
    """
    config = WidgetConfig.query.filter_by(widget_token=token).first()
    if not config:
        return "<p style='font-family:sans-serif;color:#888'>Widget not found.</p>", 404

    # Apply URL overrides (in-memory only — not persisted)
    config.theme         = request.args.get("theme",          config.theme)
    config.widget_type   = request.args.get("type",           config.widget_type)
    config.primary_color = request.args.get("primary_color",  config.primary_color)
    max_items_param      = request.args.get("max_items", type=int)
    if max_items_param:
        config.max_items = max_items_param

    product_id = request.args.get("product_id", type=int)
    store_id   = config.store_id

    # Use the store's saved engine preference (fallback to custom so it always works without a key)
    engine = config.engine_preference or "custom"

    try:
        if product_id:
            recommendations = get_recommendations(
                store_id=store_id,
                source_product_id=product_id,
                session_id=request.args.get("session_id"),
                engine=engine,
                max_items=config.max_items,
            )
        else:
            recommendations = get_trending_recommendations(
                store_id=store_id,
                max_items=config.max_items,
            )
    except Exception:
        recommendations = []

    widget_url = f"{os.getenv('WIDGET_BASE_URL', 'http://localhost:5000')}/widget/{token}"

    return render_template(
        "widget.html",
        config=config,
        recommendations=recommendations,
        store_id=store_id,
        widget_url=widget_url,
    )
