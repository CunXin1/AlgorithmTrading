"""
API views for stock news.
"""
from django.http import JsonResponse
from django.views import View

from ..models import Stock, StockNews
from ..services import (
    fetch_and_save_stock_news,
    fetch_and_save_query_news,
    fetch_news_from_rss,
    get_cached_news,
)


def serialize_news(news_items):
    """Serialize news items to JSON-compatible format."""
    news_data = []
    for item in news_items:
        # Extract source from title if present (Google News format: "Title - Source")
        title = item.title
        source = ''
        if ' - ' in title:
            parts = title.rsplit(' - ', 1)
            if len(parts) == 2:
                title = parts[0]
                source = parts[1]
        
        news_data.append({
            'id': item.id,
            'title': title,
            'link': item.link,
            'description': item.description,
            'published': item.pub_date.isoformat() if item.pub_date else None,
            'source': source,
        })
    return news_data


class StockNewsView(View):
    """
    Stock News API View
    
    GET /stock/news/<symbol>/
        Returns news for a stock. If no news in DB, fetches from RSS.
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
        
        # Check if we have cached news
        cached_news = get_cached_news(stock=stock)
        if cached_news:
            return JsonResponse({
                'symbol': symbol,
                'stock_name': stock.stock_name,
                'news': serialize_news(cached_news)
            })
        
        # Fetch fresh news from RSS
        try:
            fetch_and_save_stock_news(symbol)
            news = StockNews.objects.filter(stock=stock).order_by('-pub_date', '-created_at')[:15]
        except Exception as e:
            return JsonResponse({
                'error': f'Failed to fetch news: {str(e)}'
            }, status=500)
        
        return JsonResponse({
            'symbol': symbol,
            'stock_name': stock.stock_name,
            'news': serialize_news(news)
        })


class StockNewsRefreshView(View):
    """Force refresh news for a stock."""
    
    def post(self, request, symbol):
        """Refresh news for a stock symbol."""
        symbol = symbol.strip().upper()
        
        try:
            news_items = fetch_and_save_stock_news(symbol)
            
            return JsonResponse({
                'symbol': symbol,
                'count': len(news_items),
                'news': serialize_news(news_items)
            })
        except Exception as e:
            return JsonResponse({
                'error': f'Failed to refresh news: {str(e)}'
            }, status=500)


class GeneralNewsView(View):
    """
    General News API View for non-stock queries.
    
    GET /stock/news/search/?q=<query>
        Returns news for a general search query.
        Examples: "Federal Reserve Jerome Powell", "Nasdaq 100", "Bitcoin BTC"
    """

    def get(self, request):
        """Get news for a general search query."""
        query = request.GET.get('q', '').strip()
        
        if not query:
            return JsonResponse({
                'error': 'Query parameter "q" is required'
            }, status=400)
        
        # Check if we have cached news
        cached_news = get_cached_news(query=query)
        if cached_news:
            return JsonResponse({
                'query': query,
                'news': serialize_news(cached_news)
            })
        
        # Fetch fresh news from RSS
        try:
            fetch_and_save_query_news(query)
            news = StockNews.objects.filter(
                query=query, 
                stock__isnull=True
            ).order_by('-pub_date', '-created_at')[:15]
        except Exception as e:
            return JsonResponse({
                'error': f'Failed to fetch news: {str(e)}'
            }, status=500)
        
        return JsonResponse({
            'query': query,
            'news': serialize_news(news)
        })
