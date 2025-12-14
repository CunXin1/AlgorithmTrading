# authapi/views.py
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, LoginSerializer
from .models import EmailVerificationCode
from core.models import UserProfile

from django.utils.crypto import get_random_string
from django.core.mail import send_mail

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
from django.contrib.auth import logout



@api_view(["POST"])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]
    code = serializer.validated_data["code"]

    try:
        record = EmailVerificationCode.objects.filter(
            email=email, code=code
        ).first()
    except EmailVerificationCode.DoesNotExist:
        record = None

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
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = authenticate(request, username=user.username, password=password)
    if not user:
        return Response(
            {"error": "Incorrect password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)  # ⭐ 登录成功

    return Response({"ok": True})


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"ok": True})


@api_view(["POST"])
def send_verification_code(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    # 生成 6 位数字验证码
    code = get_random_string(length=6, allowed_chars="0123456789")

    EmailVerificationCode.objects.create(
        email=email,
        code=code,
    )

    # ⚠️ 这里假设你已经配置好 Django email backend
    send_mail(
        subject="Your AlgorithmTrading verification code",
        message=f"Your verification code is: {code}",
        from_email=None,  # settings.DEFAULT_FROM_EMAIL
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({"ok": True})


@require_GET
@login_required
def me_view(request):
    """
    GET /api/auth/me/
    返回当前已登录用户信息（基于 session）
    """
    user = request.user
    return JsonResponse({
        "id": user.id,
        "email": user.email,
        "username": user.username,
    })