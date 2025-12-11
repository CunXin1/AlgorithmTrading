# authapi/views.py
# ------------------------------------------------------------
# HTTP API views for authentication.
# 对应 Node 里的 authController.js。
# ------------------------------------------------------------

from typing import Any, Dict

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, LoginSerializer
from .services import register_user, login_user


class RegisterView(APIView):
    """
    Handle user registration requests.

    POST /api/auth/register

    Expected JSON body:
      {
        "email": "user@example.com",
        "password": "plain-text-password"
      }

    Success response (200):
      {
        "success": true,
        "user": {
          "id": 1,
          "email": "user@example.com"
        }
      }

    Error response (400):
      {
        "error": "User already exists"
      }
      or
      {
        "error": "Invalid data: <details>"
      }

    中文说明：
      - 处理用户注册请求，路径为 /api/auth/register
      - 请求体必须包含 email 与 password 字段
      - 成功时返回与 Node 版本一致的 JSON 结构
      - 若邮箱已存在或数据不合法，则返回 400 + error 字段
    """

    def post(self, request, *args, **kwargs) -> Response:
        # 使用 serializer 校验 email / password
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            # 参数校验失败，统一报 400
            return Response(
                {"error": f"Invalid data: {serializer.errors}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            result: Dict[str, Any] = register_user(email, password)
            # 对齐你 Node 的行为：状态码 200 + JSON
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            # 业务逻辑错误，例如 "User already exists"
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            # 其他服务器内部错误
            return Response(
                {"error": "Register failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(APIView):
    """
    Handle user login requests.

    POST /api/auth/login

    Expected JSON body:
      {
        "email": "user@example.com",
        "password": "plain-text-password"
      }

    Success response (200):
      {
        "success": true,
        "token": "<JWT token string>",
        "user": {
          "id": 1,
          "email": "user@example.com"
        }
      }

    Error response (401):
      {
        "error": "User not found"
      }
      or
      {
        "error": "Incorrect password"
      }

    中文说明：
      - 处理用户登录请求，路径为 /api/auth/login
      - 请求体包含 email / password
      - 成功返回 JWT token 与用户信息，结构对齐 Node
      - 用户不存在或密码错误时，返回 401 + error 信息
    """

    def post(self, request, *args, **kwargs) -> Response:
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            # 登录参数不合法（缺 email/password 或格式错误）
            return Response(
                {"error": f"Invalid data: {serializer.errors}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            result: Dict[str, Any] = login_user(email, password)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            # 用户不存在或密码错误 —— 对齐 Node：用 401
            return Response(
                {"error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception:
            # 其他服务器错误
            return Response(
                {"error": "Login failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
