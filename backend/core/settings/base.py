# core/settings/base.py
"""
Django base settings for AlgorithmTrading project.
Common settings shared between dev and prod.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# -------------------------------------------------------------
# BASE DIRECTORY
# -------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# -------------------------------------------------------------
# INSTALLED APPS
# -------------------------------------------------------------
INSTALLED_APPS = [
    "corsheaders",

    # Django built-in apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",

    # Algorithm Trading Apps
    "webauthn",
    "portfolio",
    "stock",
    "news",
    # "market_sentiment",
]

# -------------------------------------------------------------
# MIDDLEWARE (CORS MUST BE FIRST)
# -------------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -------------------------------------------------------------
# URLS & WSGI
# -------------------------------------------------------------
ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# -------------------------------------------------------------
# PASSWORD VALIDATORS
# -------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------------------------------------------
# INTERNATIONALIZATION
# -------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Los_Angeles"
USE_I18N = True
USE_TZ = True

# -------------------------------------------------------------
# Django REST Framework
# -------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}

# -------------------------------------------------------------
# JWT SETTINGS (7-day access token)
# -------------------------------------------------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
}

# -------------------------------------------------------------
# Email (SMTP - Gmail)
# -------------------------------------------------------------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = "AlgorithmTrading <algorithmtrading.noreply@gmail.com>"

# -------------------------------------------------------------
# STATIC FILES (for Django Admin)
# -------------------------------------------------------------
STATIC_URL = "/static/"
