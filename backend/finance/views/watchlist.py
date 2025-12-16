# finance/views/watchlist.py
import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required

from ..models import Watchlist


@login_required
@require_http_methods(["GET", "POST", "DELETE"])
def watchlist_api(request):
    """
    GET    -> list[str]
    POST   -> add symbol
    DELETE -> remove symbol
    """
    wl, _ = Watchlist.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return JsonResponse(wl.symbols, safe=False)

    body = json.loads(request.body or "{}")
    symbol = body.get("symbol", "")
    symbol = symbol.strip().upper()

    if not symbol:
        return JsonResponse(wl.symbols, safe=False)

    if request.method == "POST":
        if symbol not in wl.symbols:
            wl.symbols.append(symbol)
            wl.save()

    if request.method == "DELETE":
        if symbol in wl.symbols:
            wl.symbols.remove(symbol)
            wl.save()

    return JsonResponse(wl.symbols, safe=False)
