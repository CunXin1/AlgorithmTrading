# market_sentiment/views/alerts.py
import json
import os

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.db import IntegrityError

from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import AlertSubscription, EmailSubscription
from ..services.alert_logic import classify, handle_alert
from ..services.fetcher import fetch_daily_latest


@api_view(["POST"])
def subscribe_alert(request):
    email = request.data.get("email")
    obj, _ = AlertSubscription.objects.get_or_create(email=email)
    obj.enabled = True
    obj.save()
    return Response({"enabled": True})


@api_view(["DELETE"])
def unsubscribe_alert(request):
    email = request.data.get("email")
    AlertSubscription.objects.filter(email=email).update(enabled=False)
    return Response({"enabled": False})


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
