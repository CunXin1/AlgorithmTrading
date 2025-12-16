# webauthn/views/sentiment_email.py
"""
API views for sentiment email subscriptions.
"""
import json

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

from webauthn.models import SentimentEmail

MAX_EMAILS = 3


def serialize_email(sub):
    """Serialize a SentimentEmail instance to dict."""
    return {
        "id": sub.id,
        "email": sub.email,
        "enabled": sub.enabled,
    }


@login_required
@require_http_methods(["GET", "POST", "PATCH", "DELETE"])
def sentiment_email_api(request):
    """
    GET    -> list all email subscriptions for current user
    POST   -> add a new email subscription
    PATCH  -> toggle enabled status
    DELETE -> remove an email subscription
    """
    user = request.user

    # GET: list all subscriptions
    if request.method == "GET":
        subs = SentimentEmail.objects.filter(user=user)
        return JsonResponse([serialize_email(s) for s in subs], safe=False)

    # Parse JSON body for POST/PATCH/DELETE
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # POST: add new email
    if request.method == "POST":
        email = body.get("email", "").strip().lower()
        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)

        # Check max limit
        count = SentimentEmail.objects.filter(user=user).count()
        if count >= MAX_EMAILS:
            return JsonResponse({"error": f"Maximum {MAX_EMAILS} emails allowed"}, status=400)

        # Check duplicate
        if SentimentEmail.objects.filter(user=user, email=email).exists():
            return JsonResponse({"error": "Email already exists"}, status=400)

        sub = SentimentEmail.objects.create(user=user, email=email)
        return JsonResponse(serialize_email(sub), status=201)

    # PATCH: toggle enabled
    if request.method == "PATCH":
        sub_id = body.get("id")
        enabled = body.get("enabled")

        if sub_id is None:
            return JsonResponse({"error": "id is required"}, status=400)

        try:
            sub = SentimentEmail.objects.get(id=sub_id, user=user)
        except SentimentEmail.DoesNotExist:
            return JsonResponse({"error": "Not found"}, status=404)

        if enabled is not None:
            sub.enabled = bool(enabled)
            sub.save()

        return JsonResponse(serialize_email(sub))

    # DELETE: remove email
    if request.method == "DELETE":
        sub_id = body.get("id")

        if sub_id is None:
            return JsonResponse({"error": "id is required"}, status=400)

        try:
            sub = SentimentEmail.objects.get(id=sub_id, user=user)
        except SentimentEmail.DoesNotExist:
            return JsonResponse({"error": "Not found"}, status=404)

        sub.delete()
        return JsonResponse({"success": True})
