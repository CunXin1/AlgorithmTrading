# market_sentiment/urls.py
from django.urls import path
from .views import (
    SentimentOverview,
    SentimentHistory,
    SentimentMeta,
)
from .views_alerts import subscribe_alert

urlpatterns = [
    path("overview/", SentimentOverview.as_view()),
    path("index/<str:index_name>/history/", SentimentHistory.as_view()),
    path("meta/", SentimentMeta.as_view()),

    path("alerts/subscribe", subscribe_alert),

]
