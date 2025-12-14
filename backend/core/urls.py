# core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("profile/", views.profile_api),
    path("watchlist/", views.watchlist_api),
    path("subscriptions/", views.email_subscription_api),
]
