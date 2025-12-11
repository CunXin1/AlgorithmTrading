# finance/urls.py
from django.urls import path
from .views import stock_intraday_view

urlpatterns = [
    # GET /api/stocks/<symbol>?date=YYYY-MM-DD
    path("<str:symbol>", stock_intraday_view, name="stock-intraday"),
]
