# core/urls.py
from django.urls import path
from . import views
from .views import profile_api, portfolio_list_api, portfolio_detail_api

urlpatterns = [
    path("profile/", views.profile_api),
    path("watchlist/", views.watchlist_api),
    path("profile/", profile_api),
    path("email-subscription/", views.email_subscription_api),
    path("portfolios/", portfolio_list_api),
    path("portfolios/<int:portfolio_id>/", portfolio_detail_api),
]
