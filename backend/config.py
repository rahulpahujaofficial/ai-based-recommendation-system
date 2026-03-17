import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///recoai.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # Recommendation
    # "gemini" | "custom"
    RECOMMENDATION_ENGINE = os.getenv("RECOMMENDATION_ENGINE", "gemini")
    MAX_RECOMMENDATIONS = int(os.getenv("MAX_RECOMMENDATIONS", "10"))

    # Widget
    WIDGET_BASE_URL = os.getenv("WIDGET_BASE_URL", "http://localhost:5000")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")  # Vite default port

    # Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    ALLOWED_EXTENSIONS = {"csv"}
