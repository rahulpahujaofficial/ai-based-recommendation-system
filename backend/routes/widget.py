from flask import Blueprint, request, jsonify, render_template
from services.widget_service import get_or_create_widget, update_widget_config, generate_embed_codes
from services.recommendation_engine import get_recommendations, get_trending_recommendations
from models import WidgetConfig

bp = Blueprint("widget", __name__)


# -----------------------------------------------------------------------
# Widget configuration API
# -----------------------------------------------------------------------

@bp.get("/api/widget/config")
def get_config():
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    config = get_or_create_widget(store_id)
    return jsonify(config.to_dict())


@bp.put("/api/widget/config")
def update_config():
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    config = update_widget_config(store_id, data)
    return jsonify(config.to_dict())


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
    Query params:
      theme       dark | light
      type        carousel | grid | list
      product_id  <int> source product for context-aware recs
    """
    config = WidgetConfig.query.filter_by(widget_token=token).first()
    if not config:
        return "<p style='font-family:sans-serif;color:#888'>Widget not found.</p>", 404

    # Allow URL overrides for quick customisation without saving DB
    theme = request.args.get("theme", config.theme)
    widget_type = request.args.get("type", config.widget_type)
    product_id = request.args.get("product_id", type=int)

    # Override config object fields for template rendering
    config.theme = theme
    config.widget_type = widget_type

    store_id = config.store_id

    try:
        if product_id:
            recommendations = get_recommendations(
                store_id=store_id,
                source_product_id=product_id,
                session_id=request.args.get("session_id"),
                max_items=config.max_items,
            )
        else:
            recommendations = get_trending_recommendations(store_id=store_id, max_items=config.max_items)
    except Exception:
        recommendations = []

    import os
    widget_url = f"{os.getenv('WIDGET_BASE_URL', 'http://localhost:5000')}/widget/{token}"

    return render_template(
        "widget.html",
        config=config,
        recommendations=recommendations,
        store_id=store_id,
        widget_url=widget_url,
    )
