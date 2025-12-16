# webauthn/views/auth.py
"""
Authentication views: register, login, logout, verification code.
"""
from threading import Thread

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.conf import settings
from django.utils.crypto import get_random_string
from django.core.mail import send_mail

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from webauthn.serializers import RegisterSerializer, LoginSerializer
from webauthn.models import EmailVerificationCode, UserProfile


@require_GET
@ensure_csrf_cookie
def csrf_token_view(request):
    """Return CSRF token and set cookie."""
    return JsonResponse({"ok": True})


@api_view(["POST"])
def register_view(request):
    """Register a new user with email verification."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    username = serializer.validated_data["username"]
    first_name = serializer.validated_data.get("first_name", "")
    last_name = serializer.validated_data.get("last_name", "")
    password = serializer.validated_data["password"]
    code = serializer.validated_data["code"]
    avatar = serializer.validated_data.get("avatar", "")

    record = EmailVerificationCode.objects.filter(email=email, code=code).first()

    if not record or record.is_expired():
        return Response(
            {"error": "Invalid or expired code"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    UserProfile.objects.create(
        user=user,
        user_profile_img=avatar if avatar else None,
    )

    login(request, user)

    return Response({"ok": True}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def login_view(request):
    """Login with email and password."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        u = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = authenticate(request, username=u.username, password=password)
    if not user:
        return Response(
            {"error": "Incorrect password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)

    return Response({"ok": True})


@api_view(["POST"])
def logout_view(request):
    """Logout current user."""
    logout(request)
    return Response({"ok": True})


def _send_email_async(subject, message, recipient):
    """Send email in background thread."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
    except Exception as e:
        print("[EMAIL ERROR]", e)


@api_view(["POST"])
def send_verification_code(request):
    """Send verification code to email."""
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    code = get_random_string(length=6, allowed_chars="0123456789")

    EmailVerificationCode.objects.create(
        email=email,
        code=code,
    )

    Thread(
        target=_send_email_async,
        args=(
            "Your AlgorithmTrading verification code",
            f"Your verification code is: {code}",
            email,
        ),
        daemon=True,
    ).start()

    return Response({"ok": True})


@require_GET
@login_required
def me_view(request):
    """Return current logged-in user info."""
    user = request.user
    return JsonResponse(
        {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }
    )
