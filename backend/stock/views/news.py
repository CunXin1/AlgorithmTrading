"""
API views for stock news.
"""
from django.http import JsonResponse
from django.views import View

from ..models import Stock, StockNews
from ..services import fetch_and_save_stock_news


class StockNewsView(View):
    """
    Stock News API View
    
    GET /stock/news/<symbol>/
        Returns news for a stock. If no news in DB, fetches from RSS.
        
    POST /stock/news/<symbol>/refresh/
        Force refresh news from RSS feed.
    """

    def get(self, request, symbol):
        """Get news for a stock symbol."""
        symbol = symbol.strip().upper()
        
        try:
            stock = Stock.objects.get(stock_symbol=symbol)
        except Stock.DoesNotExist:
            # Create the stock if it doesn't exist
            stock = Stock.objects.create(
                stock_symbol=symbol,
                stock_name=symbol
            )
        
        # Check if we have news in DB
        news = StockNews.objects.filter(stock=stock).order_by('-pub_date', '-created_at')[:15]
        
        # If no news, fetch from RSS
        if not news.exists():
            try:
                fetch_and_save_stock_news(symbol)
                news = StockNews.objects.filter(stock=stock).order_by('-pub_date', '-created_at')[:15]
            except Exception as e:
                return JsonResponse({
                    'error': f'Failed to fetch news: {str(e)}'
                }, status=500)
        
        # Serialize news
        news_data = []
        for item in news:
            news_data.append({
                'id': item.id,
                'title': item.title,
                'link': item.link,
                'description': item.description,
                'pub_date': item.pub_date.isoformat() if item.pub_date else None,
            })
        
        return JsonResponse({
            'symbol': symbol,
            'stock_name': stock.stock_name,
            'news': news_data
        })


class StockNewsRefreshView(View):
    """Force refresh news for a stock."""
    
    def post(self, request, symbol):
        """Refresh news for a stock symbol."""
        symbol = symbol.strip().upper()
        
        try:
            news_items = fetch_and_save_stock_news(symbol)
            
            # Serialize news
            news_data = []
            for item in news_items:
                news_data.append({
                    'id': item.id,
                    'title': item.title,
                    'link': item.link,
                    'description': item.description,
                    'pub_date': item.pub_date.isoformat() if item.pub_date else None,
                })
            
            return JsonResponse({
                'symbol': symbol,
                'count': len(news_items),
                'news': news_data
            })
        except Exception as e:
            return JsonResponse({
                'error': f'Failed to refresh news: {str(e)}'
            }, status=500)
