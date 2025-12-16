# core/urls.py
"""
URL configuration for AlgorithmTrading project.
Each app defines its own full API path.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("webauthn.urls")),
    path("", include("stock.urls")),
    # path("", include("finance.urls")),
    # path("", include("news.urls")),
    # path("", include("market_sentiment.urls")),
]
