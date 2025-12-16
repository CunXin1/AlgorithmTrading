import json
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect

from ..models import WatchList, Stock


@method_decorator(csrf_protect, name='dispatch')
class WatchlistView(View):
    """
    Watchlist API View
    
    GET: Returns list of stock symbols in user's watchlist
    POST: Add a stock symbol to watchlist
    DELETE: Remove a stock symbol from watchlist
    """

    def get(self, request):
        """Get user's watchlist symbols."""
        if not request.user.is_authenticated:
            return JsonResponse([], safe=False, status=200)
        
        watchlist, _ = WatchList.objects.get_or_create(user=request.user)
        symbols = list(watchlist.stocks.values_list('stock_symbol', flat=True))
        return JsonResponse(symbols, safe=False)

    def post(self, request):
        """Add a stock to user's watchlist."""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            data = json.loads(request.body)
            symbol = data.get('symbol', '').strip().upper()
        except (json.JSONDecodeError, AttributeError):
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        if not symbol:
            return JsonResponse({'error': 'Symbol is required'}, status=400)
        
        # Get or create the stock
        stock, _ = Stock.objects.get_or_create(
            stock_symbol=symbol,
            defaults={'stock_name': symbol}
        )
        
        # Get or create user's watchlist and add the stock
        watchlist, _ = WatchList.objects.get_or_create(user=request.user)
        watchlist.stocks.add(stock)
        
        # Return updated watchlist
        symbols = list(watchlist.stocks.values_list('stock_symbol', flat=True))
        return JsonResponse(symbols, safe=False)

    def delete(self, request):
        """Remove a stock from user's watchlist."""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            data = json.loads(request.body)
            symbol = data.get('symbol', '').strip().upper()
        except (json.JSONDecodeError, AttributeError):
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        if not symbol:
            return JsonResponse({'error': 'Symbol is required'}, status=400)
        
        try:
            watchlist = WatchList.objects.get(user=request.user)
            stock = Stock.objects.get(stock_symbol=symbol)
            watchlist.stocks.remove(stock)
        except (WatchList.DoesNotExist, Stock.DoesNotExist):
            pass  # Silently ignore if watchlist or stock doesn't exist
        
        # Return updated watchlist
        watchlist, _ = WatchList.objects.get_or_create(user=request.user)
        symbols = list(watchlist.stocks.values_list('stock_symbol', flat=True))
        return JsonResponse(symbols, safe=False)
