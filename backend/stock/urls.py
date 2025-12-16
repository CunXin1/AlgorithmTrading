from django.urls import path
from .views import WatchlistView, StockNewsView, StockNewsRefreshView, GeneralNewsView

urlpatterns = [
    path('stock/watchlist/', WatchlistView.as_view(), name='watchlist'),
    # General news search (must be before stock news to avoid 'search' being treated as symbol)
    path('stock/news/search/', GeneralNewsView.as_view(), name='general_news'),
    path('stock/news/<str:symbol>/', StockNewsView.as_view(), name='stock_news'),
    path('stock/news/<str:symbol>/refresh/', StockNewsRefreshView.as_view(), name='stock_news_refresh'),
]
