"""
Comprehensive API test suite for RecoAI backend.

Run all tests:
    pytest test_api.py -v

Run specific test class:
    pytest test_api.py::TestStores -v

Run with coverage:
    pytest test_api.py --cov=. --cov-report=html

Install pytest if not already installed:
    pip install pytest pytest-cov
"""

import json
import tempfile
import os
from datetime import datetime
import pytest
from app import create_app
from config import Config
from database.db import db


class TestConfig(Config):
    """Test configuration with in-memory SQLite database."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app(TestConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create CLI runner for Flask commands."""
    return app.test_cli_runner()


# =========================================================================
# STORES TESTS
# =========================================================================

class TestStores:
    """Test store management endpoints."""

    def test_create_store_success(self, client):
        """Test successful store creation."""
        response = client.post("/api/stores/", json={
            "name": "Test Store",
            "domain": "test.example.com"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "Test Store"
        assert data["domain"] == "test.example.com"
        assert "store_id" in data
        assert "created_at" in data

    def test_create_store_auto_generate_id(self, client):
        """Test store creation with auto-generated ID."""
        response = client.post("/api/stores/", json={
            "name": "Auto ID Store"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "Auto ID Store"
        assert data["store_id"] is not None

    def test_create_store_custom_id(self, client):
        """Test store creation with custom ID."""
        response = client.post("/api/stores/", json={
            "name": "Custom ID Store",
            "store_id": "custom_store_123"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["store_id"] == "custom_store_123"

    def test_create_store_missing_name(self, client):
        """Test store creation fails without name."""
        response = client.post("/api/stores/", json={})
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_create_store_duplicate_id(self, client):
        """Test cannot create store with duplicate ID."""
        # Create first store
        response1 = client.post("/api/stores/", json={
            "name": "Store 1",
            "store_id": "duplicate_test"
        })
        assert response1.status_code == 201

        # Try to create duplicate
        response2 = client.post("/api/stores/", json={
            "name": "Store 2",
            "store_id": "duplicate_test"
        })
        assert response2.status_code == 409

    def test_get_store(self, client):
        """Test retrieving a single store."""
        # Create store
        create_resp = client.post("/api/stores/", json={
            "name": "Get Test Store",
            "store_id": "get_test_store"
        })
        assert create_resp.status_code == 201

        # Get store
        response = client.get("/api/stores/get_test_store")
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Get Test Store"
        assert data["store_id"] == "get_test_store"

    def test_get_store_not_found(self, client):
        """Test retrieving non-existent store."""
        response = client.get("/api/stores/nonexistent")
        assert response.status_code == 404

    def test_update_store(self, client):
        """Test updating a store."""
        # Create store
        create_resp = client.post("/api/stores/", json={
            "name": "Original Name",
            "store_id": "update_test_store"
        })
        assert create_resp.status_code == 201

        # Update store
        response = client.put("/api/stores/update_test_store", json={
            "name": "Updated Name",
            "domain": "updated.example.com"
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Updated Name"
        assert data["domain"] == "updated.example.com"

    def test_list_stores(self, client):
        """Test listing all stores."""
        # Create multiple stores
        for i in range(3):
            client.post("/api/stores/", json={
                "name": f"Store {i}",
                "store_id": f"store_{i}"
            })

        # List stores
        response = client.get("/api/stores/")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 3


# =========================================================================
# PRODUCTS TESTS
# =========================================================================

class TestProducts:
    """Test product management endpoints."""

    @pytest.fixture
    def store_id(self, client):
        """Create and return a test store."""
        response = client.post("/api/stores/", json={
            "name": "Product Test Store",
            "store_id": "product_test_store"
        })
        assert response.status_code == 201
        return "product_test_store"

    def test_create_product(self, client, store_id):
        """Test successful product creation."""
        response = client.post("/api/products/", json={
            "store_id": store_id,
            "name": "Test Product",
            "description": "A great product",
            "category": "Electronics",
            "price": 99.99,
            "image_url": "https://example.com/image.jpg",
            "tags": ["new", "featured"],
            "rating": 4.5,
            "review_count": 10,
            "stock": 50
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "Test Product"
        assert data["price"] == 99.99
        assert data["store_id"] == store_id

    def test_create_product_minimal(self, client, store_id):
        """Test product creation with minimal fields."""
        response = client.post("/api/products/", json={
            "store_id": store_id,
            "name": "Minimal Product"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "Minimal Product"

    def test_create_product_missing_store_id(self, client):
        """Test product creation fails without store_id."""
        response = client.post("/api/products/", json={
            "name": "Test Product"
        })
        assert response.status_code == 400

    def test_list_products(self, client, store_id):
        """Test listing products."""
        # Create products
        for i in range(5):
            client.post("/api/products/", json={
                "store_id": store_id,
                "name": f"Product {i}",
                "category": "Electronics" if i % 2 == 0 else "Books",
                "price": 10.0 + i
            })

        # List all products
        response = client.get(f"/api/products/?store_id={store_id}")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] >= 5
        assert len(data["products"]) > 0

    def test_list_products_pagination(self, client, store_id):
        """Test products pagination."""
        # Create 25 products
        for i in range(25):
            client.post("/api/products/", json={
                "store_id": store_id,
                "name": f"Product {i}"
            })

        # Get first page
        response = client.get(f"/api/products/?store_id={store_id}&page=1&per_page=10")
        assert response.status_code == 200
        data = response.get_json()
        assert data["page"] == 1
        assert data["per_page"] == 10
        assert len(data["products"]) == 10
        assert data["pages"] >= 3

    def test_list_products_by_category(self, client, store_id):
        """Test filtering products by category."""
        # Create products in different categories
        for i in range(3):
            client.post("/api/products/", json={
                "store_id": store_id,
                "name": f"Tech Product {i}",
                "category": "Electronics"
            })

        for i in range(2):
            client.post("/api/products/", json={
                "store_id": store_id,
                "name": f"Book {i}",
                "category": "Books"
            })

        # Filter by category
        response = client.get(f"/api/products/?store_id={store_id}&category=Electronics")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] == 3
        assert all(p["category"] == "Electronics" for p in data["products"])

    def test_search_products(self, client, store_id):
        """Test searching products by name."""
        # Create products
        client.post("/api/products/", json={
            "store_id": store_id,
            "name": "iPhone 15"
        })
        client.post("/api/products/", json={
            "store_id": store_id,
            "name": "Samsung Galaxy"
        })

        # Search
        response = client.get(f"/api/products/?store_id={store_id}&q=iPhone")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] == 1
        assert data["products"][0]["name"] == "iPhone 15"

    def test_list_products_missing_store_id(self, client):
        """Test listing products fails without store_id."""
        response = client.get("/api/products/")
        assert response.status_code == 400

    def test_get_product(self, client, store_id):
        """Test retrieving a single product."""
        # Create product
        create_resp = client.post("/api/products/", json={
            "store_id": store_id,
            "name": "Test Product",
            "price": 29.99
        })
        product_id = create_resp.get_json()["id"]

        # Get product
        response = client.get(f"/api/products/{product_id}?store_id={store_id}")
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Test Product"
        assert data["price"] == 29.99

    def test_get_product_not_found(self, client, store_id):
        """Test retrieving non-existent product."""
        response = client.get(f"/api/products/9999?store_id={store_id}")
        assert response.status_code == 404

    def test_update_product(self, client, store_id):
        """Test updating a product."""
        # Create product
        create_resp = client.post("/api/products/", json={
            "store_id": store_id,
            "name": "Original Name",
            "price": 19.99
        })
        product_id = create_resp.get_json()["id"]

        # Update product
        response = client.put(f"/api/products/{product_id}", json={
            "store_id": store_id,
            "name": "Updated Name",
            "price": 24.99
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Updated Name"
        assert data["price"] == 24.99

    def test_delete_product(self, client, store_id):
        """Test deleting a product."""
        # Create product
        create_resp = client.post("/api/products/", json={
            "store_id": store_id,
            "name": "To Be Deleted"
        })
        product_id = create_resp.get_json()["id"]

        # Delete product
        response = client.delete(f"/api/products/{product_id}?store_id={store_id}")
        assert response.status_code == 200

        # Verify deleted
        get_resp = client.get(f"/api/products/{product_id}?store_id={store_id}")
        assert get_resp.status_code == 404


# =========================================================================
# RECOMMENDATIONS TESTS
# =========================================================================

class TestRecommendations:
    """Test recommendation endpoints."""

    @pytest.fixture
    def store_with_products(self, client):
        """Create a store with sample products."""
        # Create store
        store_resp = client.post("/api/stores/", json={
            "name": "Rec Test Store",
            "store_id": "rec_test_store"
        })
        store_id = store_resp.get_json()["store_id"]

        # Create products
        product_ids = []
        for i in range(5):
            prod_resp = client.post("/api/products/", json={
                "store_id": store_id,
                "name": f"Product {i}",
                "category": "Electronics",
                "price": 10.0 + i,
                "rating": 3.5 + (i * 0.2)
            })
            product_ids.append(prod_resp.get_json()["id"])

        return store_id, product_ids

    def test_get_trending_recommendations(self, client, store_with_products):
        """Test getting trending recommendations."""
        store_id, _ = store_with_products

        response = client.get(f"/api/recommendations/trending?store_id={store_id}&max_items=3")
        assert response.status_code == 200
        data = response.get_json()
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)

    def test_recommendations_no_source_product(self, client, store_with_products):
        """Test recommendations without source product returns trending."""
        store_id, _ = store_with_products

        response = client.get(f"/api/recommendations/?store_id={store_id}")
        assert response.status_code == 200
        data = response.get_json()
        assert data["engine"] == "trending"
        assert "recommendations" in data

    def test_recommendations_with_source_product(self, client, store_with_products):
        """Test recommendations with source product."""
        store_id, product_ids = store_with_products

        response = client.get(
            f"/api/recommendations/?store_id={store_id}&product_id={product_ids[0]}&max_items=3"
        )
        assert response.status_code == 200
        data = response.get_json()
        assert "recommendations" in data
        assert data["source_product_id"] == product_ids[0]

    def test_recommendations_missing_store_id(self, client):
        """Test recommendations fail without store_id."""
        response = client.get("/api/recommendations/")
        assert response.status_code == 400

    def test_recommendations_invalid_product_id(self, client, store_with_products):
        """Test recommendations with invalid product_id."""
        store_id, _ = store_with_products

        response = client.get(
            f"/api/recommendations/?store_id={store_id}&product_id=9999"
        )
        assert response.status_code == 404

    def test_recommendations_max_items(self, client, store_with_products):
        """Test max_items parameter."""
        store_id, _ = store_with_products

        response = client.get(
            f"/api/recommendations/trending?store_id={store_id}&max_items=2"
        )
        assert response.status_code == 200
        data = response.get_json()
        # Should return at most 2 items
        assert len(data["recommendations"]) <= 2


# =========================================================================
# ANALYTICS TESTS
# =========================================================================

class TestAnalytics:
    """Test analytics endpoints."""

    @pytest.fixture
    def store_with_products(self, client):
        """Create a store with sample products."""
        store_resp = client.post("/api/stores/", json={
            "name": "Analytics Test Store",
            "store_id": "analytics_test_store"
        })
        store_id = store_resp.get_json()["store_id"]

        product_ids = []
        for i in range(3):
            prod_resp = client.post("/api/products/", json={
                "store_id": store_id,
                "name": f"Product {i}"
            })
            product_ids.append(prod_resp.get_json()["id"])

        return store_id, product_ids

    def test_track_event_view(self, client, store_with_products):
        """Test tracking a view event."""
        store_id, product_ids = store_with_products

        response = client.post("/api/analytics/event", json={
            "store_id": store_id,
            "session_id": "session_123",
            "product_id": product_ids[0],
            "event_type": "view"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["status"] == "tracked"

    def test_track_event_click(self, client, store_with_products):
        """Test tracking a click event."""
        store_id, product_ids = store_with_products

        response = client.post("/api/analytics/event", json={
            "store_id": store_id,
            "session_id": "session_123",
            "product_id": product_ids[0],
            "event_type": "click"
        })
        assert response.status_code == 201

    def test_track_event_purchase(self, client, store_with_products):
        """Test tracking a purchase event."""
        store_id, product_ids = store_with_products

        response = client.post("/api/analytics/event", json={
            "store_id": store_id,
            "session_id": "session_123",
            "product_id": product_ids[0],
            "event_type": "purchase"
        })
        assert response.status_code == 201

    def test_track_event_missing_store_id(self, client):
        """Test tracking event fails without store_id."""
        response = client.post("/api/analytics/event", json={
            "session_id": "session_123",
            "event_type": "view"
        })
        assert response.status_code == 400

    def test_track_event_missing_session_id(self, client, store_with_products):
        """Test tracking event fails without session_id."""
        store_id, _ = store_with_products

        response = client.post("/api/analytics/event", json={
            "store_id": store_id,
            "event_type": "view"
        })
        assert response.status_code == 400

    def test_track_event_missing_event_type(self, client, store_with_products):
        """Test tracking event fails without event_type."""
        store_id, _ = store_with_products

        response = client.post("/api/analytics/event", json={
            "store_id": store_id,
            "session_id": "session_123"
        })
        assert response.status_code == 400

    def test_track_event_with_metadata(self, client, store_with_products):
        """Test tracking event with additional metadata."""
        store_id, product_ids = store_with_products

        response = client.post("/api/analytics/event", json={
            "store_id": store_id,
            "session_id": "session_123",
            "product_id": product_ids[0],
            "event_type": "view",
            "extra_data": {
                "source": "email",
                "campaign": "summer_sale"
            }
        })
        assert response.status_code == 201

    def test_analytics_summary(self, client, store_with_products):
        """Test analytics summary endpoint."""
        store_id, product_ids = store_with_products

        # Track some events
        for i in range(3):
            client.post("/api/analytics/event", json={
                "store_id": store_id,
                "session_id": f"session_{i}",
                "product_id": product_ids[0],
                "event_type": "view"
            })

        # Get summary
        response = client.get(f"/api/analytics/summary?store_id={store_id}&days=30")
        assert response.status_code == 200
        data = response.get_json()
        assert "store_id" in data
        assert data["store_id"] == store_id

    def test_analytics_summary_missing_store_id(self, client):
        """Test analytics summary fails without store_id."""
        response = client.get("/api/analytics/summary")
        assert response.status_code == 400


# =========================================================================
# WIDGET TESTS
# =========================================================================

class TestWidget:
    """Test widget endpoints."""

    @pytest.fixture
    def store_with_config(self, client):
        """Create a store and get widget config."""
        store_resp = client.post("/api/stores/", json={
            "name": "Widget Test Store",
            "store_id": "widget_test_store"
        })
        store_id = store_resp.get_json()["store_id"]

        # Widget config is auto-created with store
        return store_id

    def test_get_widget_config(self, client, store_with_config):
        """Test retrieving widget configuration."""
        store_id = store_with_config

        response = client.get(f"/api/widget/config?store_id={store_id}")
        assert response.status_code == 200
        data = response.get_json()
        assert data["store_id"] == store_id
        assert "widget_token" in data
        assert "theme" in data
        assert "widget_type" in data

    def test_update_widget_config(self, client, store_with_config):
        """Test updating widget configuration."""
        store_id = store_with_config

        response = client.put("/api/widget/config", json={
            "store_id": store_id,
            "theme": "dark",
            "widget_type": "grid",
            "max_items": 8
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["theme"] == "dark"
        assert data["widget_type"] == "grid"

    def test_get_widget_config_missing_store_id(self, client):
        """Test getting widget config fails without store_id."""
        response = client.get("/api/widget/config")
        assert response.status_code == 400

    def test_get_embed_codes(self, client, store_with_config):
        """Test getting embed codes."""
        store_id = store_with_config

        response = client.get(f"/api/widget/embed-codes?store_id={store_id}")
        assert response.status_code == 200
        data = response.get_json()
        # Check for any embed code format
        assert any(key in data for key in ["embed_html", "embed_code", "code", "iframe_tag", "script_tag"])

    def test_get_embed_codes_missing_store_id(self, client):
        """Test getting embed codes fails without store_id."""
        response = client.get("/api/widget/embed-codes")
        assert response.status_code == 400

    def test_serve_widget(self, client, store_with_config):
        """Test serving the widget HTML."""
        store_id = store_with_config

        # Get widget token
        config_resp = client.get(f"/api/widget/config?store_id={store_id}")
        token = config_resp.get_json()["widget_token"]

        # Serve widget
        response = client.get(f"/widget/{token}")
        assert response.status_code == 200
        assert "text/html" in response.content_type

    def test_serve_widget_invalid_token(self, client):
        """Test serving widget with invalid token."""
        response = client.get("/widget/invalid_token_123")
        assert response.status_code == 404


# =========================================================================
# INTEGRATION TESTS
# =========================================================================

class TestIntegration:
    """Integration tests for full workflows."""

    def test_end_to_end_store_and_products(self, client):
        """Test complete workflow: create store, add products, list them."""
        # Create store
        store_resp = client.post("/api/stores/", json={
            "name": "E2E Test Store",
            "domain": "e2e.example.com"
        })
        assert store_resp.status_code == 201
        store_id = store_resp.get_json()["store_id"]

        # Add products
        for i in range(3):
            prod_resp = client.post("/api/products/", json={
                "store_id": store_id,
                "name": f"Product {i}",
                "category": "Electronics",
                "price": 50.0 + i
            })
            assert prod_resp.status_code == 201

        # List products
        list_resp = client.get(f"/api/products/?store_id={store_id}")
        assert list_resp.status_code == 200
        data = list_resp.get_json()
        assert data["total"] == 3

    def test_end_to_end_with_analytics(self, client):
        """Test workflow with analytics tracking."""
        # Create store
        store_resp = client.post("/api/stores/", json={
            "name": "Analytics E2E Store",
            "store_id": "analytics_e2e_store"
        })
        store_id = store_resp.get_json()["store_id"]

        # Create product
        prod_resp = client.post("/api/products/", json={
            "store_id": store_id,
            "name": "Test Product",
            "price": 99.99
        })
        product_id = prod_resp.get_json()["id"]

        # Track events
        for _ in range(3):
            event_resp = client.post("/api/analytics/event", json={
                "store_id": store_id,
                "session_id": "e2e_session",
                "product_id": product_id,
                "event_type": "view"
            })
            assert event_resp.status_code == 201

        # Get summary
        summary_resp = client.get(f"/api/analytics/summary?store_id={store_id}")
        assert summary_resp.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
