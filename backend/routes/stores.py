from flask import Blueprint, request, jsonify
from database.db import db
from models import Store
import secrets

bp = Blueprint("stores", __name__, url_prefix="/api/stores")


@bp.post("/")
def create_store():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    domain = data.get("domain", "").strip()
    if not name:
        return jsonify({"error": "name required"}), 400

    store_id = data.get("store_id") or secrets.token_urlsafe(12)
    existing = Store.query.filter_by(store_id=store_id).first()
    if existing:
        return jsonify({"error": "store_id already exists"}), 409

    store = Store(store_id=store_id, name=name, domain=domain or None)
    db.session.add(store)
    db.session.commit()

    # Auto-create widget config
    from services.widget_service import get_or_create_widget
    get_or_create_widget(store_id)

    return jsonify(store.to_dict()), 201


@bp.get("/<store_id>")
def get_store(store_id):
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    return jsonify(store.to_dict())


@bp.put("/<store_id>")
def update_store(store_id):
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    data = request.get_json(silent=True) or {}
    if "name" in data:
        store.name = data["name"].strip()
    if "domain" in data:
        store.domain = data["domain"].strip() or None
    db.session.commit()
    return jsonify(store.to_dict())


@bp.get("/")
def list_stores():
    stores = Store.query.order_by(Store.created_at.desc()).all()
    return jsonify([s.to_dict() for s in stores])
