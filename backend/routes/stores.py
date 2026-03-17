from flask import Blueprint, request, jsonify
from database.db import db
from models import Store, StoreSettings, Product, UserBehavior, Recommendation
from middleware.auth import token_required
import secrets

bp = Blueprint("stores", __name__, url_prefix="/api/stores")


@bp.post("/")
@token_required
def create_store():
    """Create a new store for the authenticated user."""
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    domain = data.get("domain", "").strip()
    if not name:
        return jsonify({"error": "name required"}), 400

    store_id = data.get("store_id") or secrets.token_urlsafe(12)
    existing = Store.query.filter_by(store_id=store_id).first()
    if existing:
        return jsonify({"error": "store_id already exists"}), 409

    store = Store(store_id=store_id, name=name, domain=domain or None, owner_id=request.user_id)
    db.session.add(store)
    db.session.commit()

    # Auto-create widget config
    from services.widget_service import get_or_create_widget
    get_or_create_widget(store_id)

    return jsonify(store.to_dict()), 201


@bp.get("/<store_id>")
@token_required
def get_store(store_id):
    """Get a specific store (must be owned by authenticated user)."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403
    return jsonify(store.to_dict())


@bp.put("/<store_id>")
@token_required
def update_store(store_id):
    """Update a store (must be owned by authenticated user)."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403
    data = request.get_json(silent=True) or {}
    if "name" in data:
        store.name = data["name"].strip()
    if "domain" in data:
        store.domain = data["domain"].strip() or None
    db.session.commit()
    return jsonify(store.to_dict())


@bp.get("/")
@token_required
def list_stores():
    """List all stores owned by the authenticated user."""
    stores = Store.query.filter_by(owner_id=request.user_id).order_by(Store.created_at.desc()).all()
    return jsonify([s.to_dict() for s in stores])


@bp.get("/<store_id>/settings")
@token_required
def get_settings(store_id):
    """Get or create StoreSettings for the given store."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403

    settings = StoreSettings.query.filter_by(store_id=store_id).first()
    if not settings:
        settings = StoreSettings(store_id=store_id)
        db.session.add(settings)
        db.session.commit()

    return jsonify(settings.to_dict())


@bp.put("/<store_id>/settings")
@token_required
def update_settings(store_id):
    """Update any subset of StoreSettings boolean fields."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403

    settings = StoreSettings.query.filter_by(store_id=store_id).first()
    if not settings:
        settings = StoreSettings(store_id=store_id)
        db.session.add(settings)

    data = request.get_json(silent=True) or {}
    allowed_fields = {
        "exclude_out_of_stock",
        "auto_retrain",
        "cross_sell_only",
        "notify_weekly_report",
        "notify_model_retrained",
        "notify_low_credit",
        "notify_integration_errors",
        "notify_new_import",
    }

    for field in allowed_fields:
        if field in data:
            setattr(settings, field, bool(data[field]))

    db.session.commit()
    return jsonify(settings.to_dict())


@bp.delete("/<store_id>/data")
@token_required
def delete_store_data(store_id):
    """Delete all Products, Recommendations, and UserBehaviors for the store."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403

    # Delete all products (which will cascade to behaviors and recommendations)
    Product.query.filter_by(store_id=store_id).delete()
    # Delete recommendations not tied to products
    Recommendation.query.filter_by(store_id=store_id).delete()
    # Delete user behaviors
    UserBehavior.query.filter_by(store_id=store_id).delete()

    db.session.commit()
    return jsonify({"success": True, "message": "Store data deleted"})
