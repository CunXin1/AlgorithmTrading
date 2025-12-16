# finance/urls.py
from django.urls import path
from . import views

app_name = "finance"

urlpatterns = [
    # Stock Data
    path("api/stocks/currentprice/<str:symbol>/", views.current_price_view, name="current-price"),
    path("api/stocks/<str:symbol>/", views.stock_intraday_view, name="stock-intraday"),

    # Watchlist
    path("api/stocks/watchlist/", views.watchlist_api, name="watchlist"),

    # Portfolio
    path("api/stocks/portfolios/<int:portfolio_id>/", views.portfolio_detail_api, name="portfolio-detail"),
]
