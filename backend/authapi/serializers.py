# authapi/serializers.py
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    """
    Serializer for user registration data.

    Fields:
      - email: user email address (used as unique identifier)
      - password: raw password string

    用户注册数据的序列化与校验器：
      - email: 用户邮箱（作为唯一标识）
      - password: 明文密码（在服务层中进行哈希存储）
    """

    email = serializers.EmailField()
    password = serializers.CharField(
        min_length=6,
        max_length=128,
        write_only=True,
        style={"input_type": "password"},
    )


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login data.

    Fields:
      - email: existing user email
      - password: raw password string

    用户登录数据的序列化与校验器：
      - email: 已注册用户邮箱
      - password: 明文密码
    """

    email = serializers.EmailField()
    password = serializers.CharField(
        min_length=1,
        max_length=128,
        write_only=True,
        style={"input_type": "password"},
    )
