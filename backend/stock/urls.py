from django.urls import path
from .views import WatchlistView, StockNewsView, StockNewsRefreshView

urlpatterns = [
    path('stock/watchlist/', WatchlistView.as_view(), name='watchlist'),
    path('stock/news/<str:symbol>/', StockNewsView.as_view(), name='stock_news'),
    path('stock/news/<str:symbol>/refresh/', StockNewsRefreshView.as_view(), name='stock_news_refresh'),
]
