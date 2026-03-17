"""Authentication routes: register, login, logout."""
from flask import Blueprint, request, jsonify
from database.db import db
from models import User
from middleware.auth import generate_token, token_required

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    """Register a new user account."""
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    full_name = data.get("full_name", "").strip()

    # Validation
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400
    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400
    if "@" not in email:
        return jsonify({"error": "invalid email format"}), 400

    # Check if user exists
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "email already registered"}), 409

    # Create user
    user = User(email=email, full_name=full_name or None)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Generate token
    token = generate_token(user.id)

    return jsonify({
        "message": "Registration successful",
        "user": user.to_dict(),
        "token": token
    }), 201


@bp.post("/login")
def login():
    """Authenticate user and return JWT token."""
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid email or password"}), 401

    token = generate_token(user.id)

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "token": token
    }), 200


@bp.post("/logout")
@token_required
def logout():
    """Logout (client-side: just delete token from localStorage)."""
    return jsonify({"message": "Logout successful"}), 200


@bp.get("/me")
@token_required
def get_current_user():
    """Get current authenticated user."""
    user = User.query.get(request.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200
