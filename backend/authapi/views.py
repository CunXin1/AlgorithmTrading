# authapi/views.py
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, LoginSerializer
from .models import EmailVerificationCode
from core.models import UserProfile

from django.utils.crypto import get_random_string
from django.core.mail import send_mail

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from django.http import JsonResponse


@api_view(["POST"])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]
    code = serializer.validated_data["code"]

    # 你这里用了 .first()，不会抛 DoesNotExist，所以不需要 try/except
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
    )

    UserProfile.objects.create(user=user, display_name=username)

    login(request, user)  # ⭐ 注册即登录（session）

    return Response({"ok": True}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def login_view(request):
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

    login(request, user)  # ⭐ 登录成功（sessionid）

    return Response({"ok": True})


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"ok": True})


def _send_email_async(subject, message, recipient):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
    except Exception as e:
        # 生产环境不要 print，可以换成 logging
        print("[EMAIL ERROR]", e)
        
        
@api_view(["POST"])
def send_verification_code(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    code = get_random_string(length=6, allowed_chars="0123456789")

    EmailVerificationCode.objects.create(
        email=email,
        code=code,
    )

    # ✅ 异步发邮件（关键）
    Thread(
        target=_send_email_async,
        args=(
            "Your AlgorithmTrading verification code",
            f"Your verification code is: {code}",
            email,
        ),
        daemon=True,
    ).start()

    # ✅ 立刻返回，不阻塞 worker
    return Response({"ok": True})


@require_GET
@login_required
def me_view(request):
    """
    GET /api/auth/me/
    返回当前已登录用户信息（基于 session）
    """
    user = request.user
    return JsonResponse(
        {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }
    )
