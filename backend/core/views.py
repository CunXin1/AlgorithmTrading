# core/views.py
import json
import profile
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
from market_sentiment.services.alert_logic import classify, handle_alert
import os
from django.db import IntegrityError

from market_sentiment.services.fetcher import fetch_daily_latest



from .models import UserProfile, Watchlist, EmailSubscription, Portfolio


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
@require_http_methods(["GET", "POST", "PATCH", "DELETE"])
def email_subscription_api(request):
    user = request.user

    # ===== GET: list subscriptions =====
    if request.method == "GET":
        subs = EmailSubscription.objects.filter(user=user)
        return JsonResponse(
            [
                {
                    "id": s.id,
                    "email": s.email,
                    "enabled": s.enabled,
                }
                for s in subs
            ],
            safe=False,
        )

    # 下面方法需要 JSON body
    body = json.loads(request.body or "{}")

    # ===== POST: add subscription =====
    if request.method == "POST":
        email = body.get("email", "").strip().lower()
        if not email:
            return JsonResponse({"error": "email required"}, status=400)

        if EmailSubscription.objects.filter(user=user).count() >= 3:
            return JsonResponse(
                {"error": "Maximum 3 emails allowed"},
                status=400,
            )

        try:
            sub, created = EmailSubscription.objects.get_or_create(
                user=user,
                email=email,
                defaults={"enabled": True},
            )
            if not created:
                return JsonResponse(
                    {"error": "Email already subscribed"},
                    status=400,
                )
        except IntegrityError:
            return JsonResponse(
                {"error": "Email already subscribed"},
                status=400,
            )

        # ✅ 订阅成功邮件
        send_mail(
            subject="Market Sentiment Alerts Enabled",
            message=(
                "You have subscribed to Market Sentiment alerts.\n\n"
                "You will receive emails when the Fear & Greed Index "
                "enters or exits extreme conditions."
            ),
            from_email=os.environ.get("EMAIL_HOST_USER"),
            recipient_list=[email],
            fail_silently=False,
        )

        # ⚠️ 关键：返回前端需要的数据
        return JsonResponse(
            {
                "id": sub.id,
                "email": sub.email,
                "enabled": sub.enabled,
            },
            status=201,
        )

    # ===== PATCH: toggle enabled =====
    if request.method == "PATCH":
        sub_id = body.get("id")
        enabled = body.get("enabled")

        try:
            sub = EmailSubscription.objects.get(id=sub_id, user=user)
        except EmailSubscription.DoesNotExist:
            return JsonResponse({"error": "not found"}, status=404)

        sub.enabled = bool(enabled)
        sub.save()

        return JsonResponse({"ok": True})

    # ===== DELETE: remove subscription =====
    if request.method == "DELETE":
        sub_id = body.get("id")

        try:
            sub = EmailSubscription.objects.get(id=sub_id, user=user)
        except EmailSubscription.DoesNotExist:
            return JsonResponse({"error": "not found"}, status=404)

        email = sub.email
        sub.delete()

        # ✅ 取消订阅邮件
        send_mail(
            subject="Market Sentiment Alerts Disabled",
            message=(
                "You have been unsubscribed from Market Sentiment alerts.\n\n"
                "You will no longer receive these emails."
            ),
            from_email=os.environ.get("EMAIL_HOST_USER"),
            recipient_list=[email],
            fail_silently=False,
        )

        return JsonResponse({"ok": True})

@require_http_methods(["POST"])
def run_market_sentiment_alerts(request):
    """
    Daily market sentiment alert runner.
    Call once per day (cron / manual).
    """

    # 1️⃣ 拿最新 Fear & Greed score
    result = fetch_daily_latest()

    # 你 fetcher 如果直接返回 score
    score = float(result["score"]) if isinstance(result, dict) else float(result)

    # 2️⃣ 算市场状态
    state = classify(score)

    # 3️⃣ 对所有订阅跑 alert logic
    subs = EmailSubscription.objects.filter(enabled=True)

    sent = 0

    for sub in subs:
        events = handle_alert(sub, state)

        for ev in events:
            if ev["type"] == "STATE_CHANGE":
                send_mail(
                    subject=f"Market Alert: {ev['to'].replace('_', ' ')}",
                    message=(
                        f"Market sentiment has changed.\n\n"
                        f"Previous state: {ev['from']}\n"
                        f"Current state: {ev['to']}\n\n"
                        f"Fear & Greed score: {score}"
                    ),
                    from_email=os.environ.get("EMAIL_HOST_USER"),
                    recipient_list=[sub.email],
                    fail_silently=False,
                )
                sent += 1

            elif ev["type"] == "PANIC_PERSIST":
                send_mail(
                    subject="Market Alert: Panic Persists",
                    message=(
                        "The market remains in a PANIC state.\n\n"
                        "Fear & Greed Index is below 10.\n"
                        "This reminder is sent every 2 days while panic persists."
                    ),
                    from_email=os.environ.get("EMAIL_HOST_USER"),
                    recipient_list=[sub.email],
                    fail_silently=False,
                )
                sent += 1

    return JsonResponse({
        "ok": True,
        "score": score,
        "state": state,
        "emails_sent": sent,
    })


@login_required
@require_http_methods(["GET", "POST", "PATCH"])
def portfolio_list_api(request):
    """
    GET  -> list portfolios (max 2)
    POST -> create portfolio (if < 2)
    """
    user = request.user
    
    if request.method == "GET":
        return JsonResponse({
            "username": request.user.username,
            "display_name": profile.display_name or request.user.username,
            "avatar": profile.avatar.url if profile.avatar else None,
            "portfolio1": profile.portfolio1,
            "portfolio2": profile.portfolio2,
        })


    if request.method == "PATCH":
        try:
            body = json.loads(request.body or "{}")
        except Exception:
            return JsonResponse({"error": "invalid json"}, status=400)

        if "portfolio1" in body:
            profile.portfolio1 = body["portfolio1"]

        if "portfolio2" in body:
            profile.portfolio2 = body["portfolio2"]

        profile.save(update_fields=["portfolio1", "portfolio2"])

        return JsonResponse({
            "ok": True,
            "portfolio1": profile.portfolio1,
            "portfolio2": profile.portfolio2,
        })
        profile.portfolio1 = body["portfolio1"]

    if "portfolio2" in body:
        profile.portfolio2 = body["portfolio2"]

    profile.save(update_fields=["portfolio1", "portfolio2"])

    return JsonResponse({
        "ok": True,
        "portfolio1": profile.portfolio1,
        "portfolio2": profile.portfolio2,
    })

    # POST
    if Portfolio.objects.filter(user=user).count() >= 2:
        return JsonResponse(
            {"error": "Maximum 2 portfolios allowed"},
            status=400,
        )

    body = json.loads(request.body or "{}")
    name = body.get("name", "").strip() or "New Portfolio"

    p = Portfolio.objects.create(
        user=user,
        name=name,
        holdings=[],
    )

    return JsonResponse(
        {
            "id": p.id,
            "name": p.name,
            "holdings": p.holdings,
        },
        status=201,
    )

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
