"""JWT authentication middleware and utilities."""
from flask import request, jsonify
from functools import wraps
import jwt
from datetime import datetime, timedelta, timezone
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")


def generate_token(user_id, expires_hours=24):
    """Generate JWT token."""
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=expires_hours),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def verify_token(token):
    """Verify JWT token, return user_id or None."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
    except Exception:
        return None


def token_required(f):
    """Decorator to require valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Missing authorization token"}), 401

        user_id = verify_token(token)
        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401

        request.user_id = user_id
        return f(*args, **kwargs)
    return decorated
