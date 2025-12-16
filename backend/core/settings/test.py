# core/settings/test.py
"""
Django test settings for AlgorithmTrading project.
Used for running tests in CI/CD pipeline.
"""

from .base import *

# -------------------------------------------------------------
# SECURITY - Test
# -------------------------------------------------------------
SECRET_KEY = "django-insecure-test-key-for-ci-cd-only"
DEBUG = False
ALLOWED_HOSTS = ["*"]

# -------------------------------------------------------------
# DATABASE - Test (in-memory SQLite for speed)
# -------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# -------------------------------------------------------------
# PASSWORD HASHERS - Use fast hasher for tests
# -------------------------------------------------------------
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# -------------------------------------------------------------
# EMAIL - Use in-memory backend for tests
# -------------------------------------------------------------
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# -------------------------------------------------------------
# CACHES - Use local memory cache for tests
# -------------------------------------------------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# -------------------------------------------------------------
# Disable logging during tests
# -------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "handlers": {
        "null": {
            "class": "logging.NullHandler",
        },
    },
    "root": {
        "handlers": ["null"],
        "level": "DEBUG",
    },
}
