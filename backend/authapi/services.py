# authapi/services.py
# ------------------------------------------------------------
# Business logic for authentication.
# 对应 Node 里的 authService.js：封装注册、登录、JWT 生成。
# ------------------------------------------------------------

from typing import Dict, Any

from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework_simplejwt.tokens import RefreshToken


def register_user(email: str, password: str) -> Dict[str, Any]:
    """
    Register a new user with the given email and password.

    Behavior:
      - Uses Django's built-in User model
      - Uses `email` as both username and email field
      - Returns a JSON-serializable dict consistent with Node version:
        { "success": true, "user": { "id": ..., "email": ... } }

    Raises:
      - ValueError("User already exists") if the email is taken.

    功能（中文说明）：
      - 使用 Django 自带的 User 模型
      - 以 email 作为用户名 username 和 email 字段
      - 若邮箱已存在，则抛出 ValueError("User already exists")
      - 成功返回与 Node 版本一致的字典结构
    """

    # 检查是否已存在该邮箱用户（对应 Prisma 的 findUnique）
    if User.objects.filter(username=email).exists():
        raise ValueError("User already exists")

    try:
        user = User.objects.create_user(username=email, email=email, password=password)
    except IntegrityError:
        # 双重保险（数据库唯一约束导致的错误）
        raise ValueError("User already exists")

    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
        },
    }


def login_user(email: str, password: str) -> Dict[str, Any]:
    """
    Authenticate a user and return a JWT token if successful.

    Behavior (aligned with your Node authService.js):
      - Lookup user by email (username)
      - If user does not exist: raise ValueError("User not found")
      - If password incorrect: raise ValueError("Incorrect password")
      - If successful:
          - Issue a JWT access token with 7-day lifetime
          - Return:
              {
                "success": true,
                "token": "<JWT string>",
                "user": { "id": ..., "email": ... }
              }

    中文说明：
      - 根据 email 查询用户，不存在则抛出 "User not found"
      - 密码错误则抛出 "Incorrect password"
      - 登录成功后，签发一个 7 天有效期的 JWT（在 settings 中配置）
      - 返回结构与 Node 版本保持一致
    """

    try:
        user = User.objects.get(username=email)
    except User.DoesNotExist:
        raise ValueError("User not found")

    if not user.check_password(password):
        raise ValueError("Incorrect password")

    # 使用 SimpleJWT 创建 refresh 与 access token
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    return {
        "success": True,
        "token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
        },
    }
