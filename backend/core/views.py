# core/views.py
import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required

from .models import UserProfile, Watchlist, EmailSubscription


@login_required
@require_http_methods(["GET", "POST"])
def profile_api(request):
    """
    GET  -> return profile info
    POST -> update display_name / username / avatar
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return JsonResponse({
            "username": request.user.username,
            "display_name": profile.display_name or request.user.username,
            "avatar": profile.avatar.url if profile.avatar else None,
        })

    # ===== POST: update profile =====
    username = request.POST.get("username", "").strip()
    display_name = request.POST.get("display_name", "").strip()
    avatar = request.FILES.get("avatar")

    # 更新 username（Django User）
    if username:
        request.user.username = username
        request.user.save()

    # 更新 display_name（Profile）
    if display_name:
        profile.display_name = display_name
    elif username:
        # 如果前端只传了 username，display_name 跟随
        profile.display_name = username

    # 更新头像
    if avatar:
        profile.avatar = avatar

    profile.save()

    return JsonResponse({
        "username": request.user.username,
        "display_name": profile.display_name,
        "avatar": profile.avatar.url if profile.avatar else None,
    })


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


@login_required
@require_http_methods(["GET", "POST", "PATCH"])
def email_subscription_api(request):
    """
    Manage market sentiment email subscriptions.
    Limit: max 3 emails per user.
    """
    if request.method == "GET":
        subs = EmailSubscription.objects.filter(user=request.user)
        return JsonResponse([
            {
                "id": s.id,
                "email": s.email,
                "enabled": s.enabled,
            }
            for s in subs
        ], safe=False)

    body = json.loads(request.body or "{}")

    if request.method == "POST":
        if EmailSubscription.objects.filter(user=request.user).count() >= 3:
            return JsonResponse(
                {"error": "Maximum 3 emails allowed"},
                status=400
            )

        email = body.get("email")
        if not email:
            return JsonResponse({"error": "email required"}, status=400)

        sub = EmailSubscription.objects.create(
            user=request.user,
            email=email,
            enabled=True
        )

        return JsonResponse({
            "id": sub.id,
            "email": sub.email,
            "enabled": sub.enabled,
        })

    if request.method == "PATCH":
        sub_id = body.get("id")
        enabled = body.get("enabled")

        try:
            sub = EmailSubscription.objects.get(
                id=sub_id,
                user=request.user
            )
            sub.enabled = bool(enabled)
            sub.save()
            return JsonResponse({"ok": True})
        except EmailSubscription.DoesNotExist:
            return JsonResponse({"error": "not found"}, status=404)
