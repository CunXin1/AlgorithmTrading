from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .services import fetch_google_news
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
import json

@require_GET
def google_news(request):
    symbol = request.GET.get("symbol")
    if not symbol:
        return JsonResponse({"error": "symbol is required"}, status=400)

    try:
        data = fetch_google_news(symbol.upper())
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


