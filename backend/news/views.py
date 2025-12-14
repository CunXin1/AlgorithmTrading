from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .services import fetch_google_news
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Watchlist
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




@login_required
@require_http_methods(["GET", "POST", "DELETE"])
def watchlist_api(request):
    wl, _ = Watchlist.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return JsonResponse(wl.symbols, safe=False)

    body = json.loads(request.body)
    symbol = body.get("symbol")

    if request.method == "POST":
        if symbol and symbol not in wl.symbols:
            wl.symbols.append(symbol)
            wl.save()
        return JsonResponse(wl.symbols, safe=False)

    if request.method == "DELETE":
        if symbol in wl.symbols:
            wl.symbols.remove(symbol)
            wl.save()
        return JsonResponse(wl.symbols, safe=False)