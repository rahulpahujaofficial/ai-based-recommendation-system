"""Notification routes: view and manage notification history."""
from flask import Blueprint, jsonify, request
from database.db import db
from models import Store, Notification
from middleware.auth import token_required
from datetime import datetime, timezone

bp = Blueprint("notifications", __name__, url_prefix="/api/stores")


@bp.get("/<store_id>/notifications")
@token_required
def get_notifications(store_id):
    """Get notification history for a store."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403

    # Get all notifications for this store, ordered by newest first
    notifications = Notification.query.filter_by(store_id=store_id).order_by(Notification.sent_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications])


@bp.post("/<store_id>/notifications/<int:notif_id>/read")
@token_required
def mark_notification_read(store_id, notif_id):
    """Mark a notification as read."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403

    notification = Notification.query.filter_by(id=notif_id, store_id=store_id).first()
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    notification.read_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(notification.to_dict())


@bp.delete("/<store_id>/notifications/<int:notif_id>")
@token_required
def delete_notification(store_id, notif_id):
    """Delete a notification."""
    store = Store.query.filter_by(store_id=store_id).first()
    if not store:
        return jsonify({"error": "Store not found"}), 404
    if store.owner_id != request.user_id:
        return jsonify({"error": "Not authorized"}), 403

    notification = Notification.query.filter_by(id=notif_id, store_id=store_id).first()
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    db.session.delete(notification)
    db.session.commit()
    return jsonify({"success": True, "message": "Notification deleted"})
