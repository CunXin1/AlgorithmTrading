from django.urls import path
from .views import google_news
from .views import watchlist_api

urlpatterns = [
    path("watchlist/", watchlist_api),
    path("google/", google_news),
]
