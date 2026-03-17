from datetime import datetime, timezone
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    """Store owner account."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    stores = db.relationship("Store", backref="owner", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "created_at": self.created_at.isoformat(),
        }


class Store(db.Model):
    """Shopify store owner / tenant."""

    __tablename__ = "stores"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    name = db.Column(db.String(255), nullable=False)
    domain = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    products = db.relationship("Product", backref="store", lazy=True, cascade="all, delete-orphan")
    behaviors = db.relationship("UserBehavior", backref="store", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "store_id": self.store_id,
            "name": self.name,
            "domain": self.domain,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat(),
        }


class Product(db.Model):
    """Product catalog item."""

    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), db.ForeignKey("stores.store_id"), nullable=False, index=True)
    external_id = db.Column(db.String(128), nullable=True)

    name = db.Column(db.String(512), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(128), nullable=True, index=True)
    price = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.String(1024), nullable=True)
    product_url = db.Column(db.String(1024), nullable=True)
    tags = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    review_count = db.Column(db.Integer, default=0)
    stock = db.Column(db.Integer, default=0)
    status = db.Column(db.String(32), default="active")

    click_count = db.Column(db.Integer, default=0)
    conversion_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "store_id": self.store_id,
            "external_id": self.external_id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "price": self.price,
            "image_url": self.image_url,
            "product_url": self.product_url,
            "tags": self.tags.split(",") if self.tags else [],
            "rating": self.rating,
            "review_count": self.review_count,
            "stock": self.stock,
            "status": self.status,
            "click_count": self.click_count,
            "conversion_count": self.conversion_count,
            "created_at": self.created_at.isoformat(),
        }


class UserBehavior(db.Model):
    """Tracks anonymous visitor behavior for a store."""

    __tablename__ = "user_behaviors"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), db.ForeignKey("stores.store_id"), nullable=False, index=True)
    session_id = db.Column(db.String(128), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=True)
    event_type = db.Column(db.String(64), nullable=False)
    extra_data = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    product = db.relationship("Product", backref="behaviors")

    def to_dict(self):
        return {
            "id": self.id,
            "store_id": self.store_id,
            "session_id": self.session_id,
            "product_id": self.product_id,
            "event_type": self.event_type,
            "extra_data": self.extra_data,
            "created_at": self.created_at.isoformat(),
        }


class Recommendation(db.Model):
    """Cached recommendation result."""

    __tablename__ = "recommendations"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), nullable=False, index=True)
    source_product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=True)
    session_id = db.Column(db.String(128), nullable=True)
    engine_used = db.Column(db.String(32), nullable=False)
    recommended_product_ids = db.Column(db.Text, nullable=False)
    scores = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    source_product = db.relationship("Product", foreign_keys=[source_product_id])

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "store_id": self.store_id,
            "source_product_id": self.source_product_id,
            "session_id": self.session_id,
            "engine_used": self.engine_used,
            "recommended_product_ids": json.loads(self.recommended_product_ids),
            "scores": json.loads(self.scores) if self.scores else {},
            "created_at": self.created_at.isoformat(),
        }


class WidgetConfig(db.Model):
    """Per-store widget configuration + generated embed token."""

    __tablename__ = "widget_configs"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    widget_token = db.Column(db.String(64), unique=True, nullable=False, index=True)
    widget_type = db.Column(db.String(32), default="carousel")
    theme = db.Column(db.String(16), default="dark")
    max_items = db.Column(db.Integer, default=6)
    title = db.Column(db.String(255), default="Recommended for You")
    primary_color = db.Column(db.String(16), default="#8b5cf6")
    engine_preference = db.Column(db.String(32), default="gemini")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "store_id": self.store_id,
            "widget_token": self.widget_token,
            "widget_type": self.widget_type,
            "theme": self.theme,
            "max_items": self.max_items,
            "title": self.title,
            "primary_color": self.primary_color,
            "engine_preference": self.engine_preference or "gemini",
        }


class StoreSettings(db.Model):
    """Per-store settings for AI behavior and notifications."""

    __tablename__ = "store_settings"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    # AI behaviour
    exclude_out_of_stock = db.Column(db.Boolean, default=True)
    auto_retrain = db.Column(db.Boolean, default=True)
    cross_sell_only = db.Column(db.Boolean, default=False)
    # Notifications
    notify_weekly_report = db.Column(db.Boolean, default=True)
    notify_model_retrained = db.Column(db.Boolean, default=True)
    notify_low_credit = db.Column(db.Boolean, default=False)
    notify_integration_errors = db.Column(db.Boolean, default=True)
    notify_new_import = db.Column(db.Boolean, default=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "store_id": self.store_id,
            "exclude_out_of_stock": self.exclude_out_of_stock,
            "auto_retrain": self.auto_retrain,
            "cross_sell_only": self.cross_sell_only,
            "notify_weekly_report": self.notify_weekly_report,
            "notify_model_retrained": self.notify_model_retrained,
            "notify_low_credit": self.notify_low_credit,
            "notify_integration_errors": self.notify_integration_errors,
            "notify_new_import": self.notify_new_import,
            "updated_at": self.updated_at.isoformat(),
        }


class Notification(db.Model):
    """Log of all notifications sent."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), db.ForeignKey("stores.store_id"), nullable=False, index=True)
    email = db.Column(db.String(255), nullable=False)
    event_type = db.Column(db.String(64), nullable=False)  # weekly_report, model_retrained, low_credit, integration_error, new_import
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    read_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "store_id": self.store_id,
            "email": self.email,
            "event_type": self.event_type,
            "subject": self.subject,
            "body": self.body,
            "sent_at": self.sent_at.isoformat(),
            "read_at": self.read_at.isoformat() if self.read_at else None,
        }
