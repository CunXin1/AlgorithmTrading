from django.urls import path
from .views import google_news

urlpatterns = [
    path("google/", google_news),
]
