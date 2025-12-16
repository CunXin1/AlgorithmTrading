# finance/views/portfolio.py
import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required

from ..models import Portfolio


@login_required
@require_http_methods(["PATCH"])
def portfolio_detail_api(request, portfolio_id):
    user = request.user

    try:
        p = Portfolio.objects.get(id=portfolio_id, user=user)
    except Portfolio.DoesNotExist:
        return JsonResponse({"error": "not found"}, status=404)

    body = json.loads(request.body or "{}")

    if "name" in body:
        p.name = body["name"][:100]

    if "holdings" in body:
        if not isinstance(body["holdings"], list):
            return JsonResponse({"error": "holdings must be list"}, status=400)
        p.holdings = body["holdings"]

    p.save()
    return JsonResponse(
        {
            "id": p.id,
            "name": p.name,
            "holdings": p.holdings,
        }
    )
