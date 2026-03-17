from datetime import datetime, timezone
from database.db import db


class Store(db.Model):
    """Shopify store owner / tenant."""

    __tablename__ = "stores"

    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
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
