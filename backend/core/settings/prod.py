# core/settings/prod.py
"""
Django production settings for AlgorithmTrading project.
"""

import os
from .base import *

# -------------------------------------------------------------
# SECURITY - Production
# -------------------------------------------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
DEBUG = False
ALLOWED_HOSTS = [
    "algorithmtrading.net",
    "www.algorithmtrading.net",
]

# -------------------------------------------------------------
# DATABASE - Production
# -------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "algorithmtrading"),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# -------------------------------------------------------------
# CORS SETTINGS - Production
# -------------------------------------------------------------
CSRF_TRUSTED_ORIGINS = [
    "https://algorithmtrading.net",
    "https://www.algorithmtrading.net",
]

CORS_ALLOWED_ORIGINS = [
    "https://algorithmtrading.net",
    "https://www.algorithmtrading.net",
]

CORS_ALLOW_CREDENTIALS = True

# -------------------------------------------------------------
# SECURITY HEADERS - Production
# -------------------------------------------------------------
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
