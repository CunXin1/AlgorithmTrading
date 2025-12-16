# core/settings/dev.py
"""
Django development settings for AlgorithmTrading project.
"""

from .base import *

# -------------------------------------------------------------
# SECURITY - Development
# -------------------------------------------------------------
SECRET_KEY = "django-insecure-1)1y9tt0*md)m1o*9)zy29vj-rb-c#!kaah!l3dil!=7xgb7=("
DEBUG = True
ALLOWED_HOSTS = ["*"]

# -------------------------------------------------------------
# DATABASE - Development (SQLite)
# -------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# -------------------------------------------------------------
# CORS SETTINGS - Development
# -------------------------------------------------------------
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True
