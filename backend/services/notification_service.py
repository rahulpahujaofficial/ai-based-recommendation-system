"""Mock email notification service."""
import logging
from database.db import db
from models import Notification, StoreSettings, Store
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def should_send_notification(event_type, store_id):
    """Check if notification is enabled in StoreSettings."""
    settings = StoreSettings.query.filter_by(store_id=store_id).first()
    if not settings:
        return True  # Default: send

    mapping = {
        'weekly_report': settings.notify_weekly_report,
        'model_retrained': settings.notify_model_retrained,
        'low_credit': settings.notify_low_credit,
        'integration_error': settings.notify_integration_errors,
        'new_import': settings.notify_new_import,
    }
    return mapping.get(event_type, True)


def send_notification(store_id, event_type, subject, body):
    """Send notification (mock: just log and store in DB)."""
    if not should_send_notification(event_type, store_id):
        return False

    store = Store.query.filter_by(store_id=store_id).first()
    if not store or not store.owner:
        return False

    email = store.owner.email

    # Log to console (mock email)
    logger.info(f"""
    📧 NOTIFICATION EMAIL
    From: noreply@recoai.com
    To: {email}
    Subject: {subject}
    ─────────────────────
    {body}
    ─────────────────────
    """)

    # Save to DB
    notification = Notification(
        store_id=store_id,
        email=email,
        event_type=event_type,
        subject=subject,
        body=body,
    )
    db.session.add(notification)
    db.session.commit()

    return True
