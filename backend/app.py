"""
RecoAI Backend — Flask application entry point.

Run locally:
    cd backend
    pip install -r requirements.txt
    python app.py

Or with gunicorn (production):
    gunicorn -w 4 -b 0.0.0.0:5000 app:app
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from database.db import db


def create_app(config: Config = None) -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.config.from_object(config or Config)

    # ------------------------------------------------------------------
    # Extensions
    # ------------------------------------------------------------------
    db.init_app(app)

    # Configure CORS — allow localhost, any GitHub Codespace domain, and the
    # explicit FRONTEND_URL set in .env.
    # Flask-CORS 6.x uses re.match() for strings that contain regex chars,
    # so we include a regex pattern for *.app.github.dev alongside the
    # exact-match localhost origins.
    frontend_url = app.config.get("FRONTEND_URL", "http://localhost:5173")

    allowed_origins = [
        frontend_url,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        # Matches any GitHub Codespace URL on any port (detected as regex by Flask-CORS)
        r"https?://.*\.app\.github\.dev$",
    ]

    CORS(
        app,
        resources={r"/api/*": {
            "origins": allowed_origins,
            "supports_credentials": True,
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "max_age": 3600,
        }},
    )

    if app.debug:
        print(f"\n📡 CORS Allowed Origins: {allowed_origins}\n")

    # ------------------------------------------------------------------
    # Blueprints
    # ------------------------------------------------------------------
    from routes.auth import bp as auth_bp
    from routes.products import bp as products_bp
    from routes.ingest import bp as ingest_bp
    from routes.recommendations import bp as recs_bp
    from routes.widget import bp as widget_bp
    from routes.analytics import bp as analytics_bp
    from routes.stores import bp as stores_bp
    from routes.notifications import bp as notifications_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(ingest_bp)
    app.register_blueprint(recs_bp)
    app.register_blueprint(widget_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(stores_bp)
    app.register_blueprint(notifications_bp)

    # ------------------------------------------------------------------
    # DB init
    # ------------------------------------------------------------------
    with app.app_context():
        db.create_all()
        # Safe migration: add engine_preference column to widget_configs if it
        # doesn't exist yet (SQLite won't add it via create_all on existing tables).
        from sqlalchemy import text
        try:
            with db.engine.connect() as conn:
                conn.execute(text(
                    "ALTER TABLE widget_configs "
                    "ADD COLUMN engine_preference VARCHAR(32) DEFAULT 'gemini'"
                ))
                conn.commit()
        except Exception:
            pass  # Column already exists — this is the happy path

    # ------------------------------------------------------------------
    # Health check
    # ------------------------------------------------------------------
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "version": "1.0.0"})

    @app.get("/")
    def index():
        return jsonify({
            "name": "RecoAI Backend",
            "version": "1.0.0",
            "docs": "/api/health",
            "endpoints": [
                "GET  /api/health",
                "POST /api/stores/",
                "GET  /api/stores/<store_id>",
                "GET  /api/products/?store_id=",
                "POST /api/products/",
                "GET  /api/products/<id>?store_id=",
                "PUT  /api/products/<id>",
                "DELETE /api/products/<id>?store_id=",
                "POST /api/ingest/csv            (multipart: store_id, file)",
                "POST /api/ingest/api            (json: store_id, api_url)",
                "POST /api/ingest/scrape/product (json: store_id, url)",
                "POST /api/ingest/scrape/catalog (json: store_id, catalog_url)",
                "GET  /api/recommendations/?store_id=&product_id=",
                "GET  /api/recommendations/trending?store_id=",
                "POST /api/recommendations/analyze",
                "GET  /api/widget/config?store_id=",
                "PUT  /api/widget/config",
                "GET  /api/widget/embed-codes?store_id=",
                "GET  /widget/<token>            (served iframe widget)",
                "POST /api/analytics/event",
                "GET  /api/analytics/summary?store_id=",
                "GET  /api/analytics/products/<id>?store_id=",
            ],
        })

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    print(f"\n🚀  RecoAI backend running at http://localhost:{port}")
    print(f"📡  CORS enabled for frontend at: {frontend_url}")
    print(f"🔗  Test connection: curl http://localhost:{port}/api/health\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
