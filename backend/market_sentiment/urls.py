# market_sentiment/urls.py
from django.urls import path
from . import views

app_name = "market_sentiment"

urlpatterns = [
    # Sentiment Data
    path("api/sentiment/overview/", views.SentimentOverview.as_view(), name="overview"),
    path("api/sentiment/index/<str:index_name>/history/", views.SentimentHistory.as_view(), name="history"),
    path("api/sentiment/meta/", views.SentimentMeta.as_view(), name="meta"),

    # Alerts & Email Subscriptions
    path("api/sentiment/alerts/subscribe/", views.subscribe_alert, name="subscribe"),
    path("api/sentiment/email-subscription/", views.email_subscription_api, name="email-subscription"),
    path("api/sentiment/run-alerts/", views.run_market_sentiment_alerts, name="run-alerts"),
]
