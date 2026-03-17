import json
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify
from sqlalchemy import func

from database.db import db
from models import Product, UserBehavior, Recommendation

bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@bp.post("/event")
def track_event():
    """
    Track a user behavior event.
    Body: { store_id, session_id, product_id, event_type, metadata? }
    event_type: view | click | add_to_cart | purchase
    """
    data = request.get_json(silent=True) or {}
    store_id = data.get("store_id")
    session_id = data.get("session_id")
    event_type = data.get("event_type")

    if not all([store_id, session_id, event_type]):
        return jsonify({"error": "store_id, session_id, event_type required"}), 400

    product_id = data.get("product_id")

    # Increment counters on the product
    if product_id:
        product = Product.query.filter_by(id=int(product_id), store_id=store_id).first()
        if product:
            if event_type == "click":
                product.click_count = (product.click_count or 0) + 1
            elif event_type in ("purchase", "add_to_cart"):
                product.conversion_count = (product.conversion_count or 0) + 1

    behavior = UserBehavior(
        store_id=store_id,
        session_id=session_id,
        product_id=int(product_id) if product_id else None,
        event_type=event_type,
        extra_data=json.dumps(data.get("extra_data")) if data.get("extra_data") else None,
    )
    db.session.add(behavior)
    db.session.commit()

    return jsonify({"status": "tracked"}), 201


@bp.get("/summary")
def summary():
    """
    GET /api/analytics/summary?store_id=X&days=30
    Returns KPIs: total products, events, top products, event breakdown.
    """
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    days = int(request.args.get("days", 30))
    since = datetime.now(timezone.utc) - timedelta(days=days)

    total_products = Product.query.filter_by(store_id=store_id, status="active").count()

    # Event counts by type
    event_counts = (
        db.session.query(UserBehavior.event_type, func.count(UserBehavior.id))
        .filter(UserBehavior.store_id == store_id, UserBehavior.created_at >= since)
        .group_by(UserBehavior.event_type)
        .all()
    )
    events = {et: cnt for et, cnt in event_counts}

    # Top clicked products
    top_products = (
        Product.query.filter_by(store_id=store_id, status="active")
        .order_by((Product.click_count + 2 * Product.conversion_count).desc())
        .limit(5)
        .all()
    )

    # Daily event volume (last N days)
    daily_events = (
        db.session.query(
            func.date(UserBehavior.created_at).label("date"),
            func.count(UserBehavior.id).label("count"),
        )
        .filter(UserBehavior.store_id == store_id, UserBehavior.created_at >= since)
        .group_by(func.date(UserBehavior.created_at))
        .order_by(func.date(UserBehavior.created_at))
        .all()
    )

    # Recommendation stats
    total_recs = Recommendation.query.filter_by(store_id=store_id).count()

    return jsonify({
        "store_id": store_id,
        "days": days,
        "total_products": total_products,
        "total_recommendations_generated": total_recs,
        "events": events,
        "top_products": [p.to_dict() for p in top_products],
        "daily_events": [{"date": str(d), "count": c} for d, c in daily_events],
    })


@bp.get("/products/<int:product_id>")
def product_analytics(product_id):
    """Per-product analytics: events over time, click/conversion rate."""
    store_id = request.args.get("store_id")
    if not store_id:
        return jsonify({"error": "store_id required"}), 400

    product = Product.query.filter_by(id=product_id, store_id=store_id).first()
    if not product:
        return jsonify({"error": "Product not found"}), 404

    days = int(request.args.get("days", 30))
    since = datetime.now(timezone.utc) - timedelta(days=days)

    events = (
        db.session.query(UserBehavior.event_type, func.count(UserBehavior.id))
        .filter(
            UserBehavior.store_id == store_id,
            UserBehavior.product_id == product_id,
            UserBehavior.created_at >= since,
        )
        .group_by(UserBehavior.event_type)
        .all()
    )

    return jsonify({
        "product": product.to_dict(),
        "events": {et: cnt for et, cnt in events},
    })
