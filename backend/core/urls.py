# core/urls.py
from django.urls import path
from . import views
from .views import profile_api

urlpatterns = [
    path("profile/", views.profile_api),
    path("watchlist/", views.watchlist_api),
    path("subscriptions/", views.email_subscription_api),
    path("profile/", profile_api),
]
