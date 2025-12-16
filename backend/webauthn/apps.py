# webauthn/apps.py
from django.apps import AppConfig


class WebauthnConfig(AppConfig):
    """
    Django AppConfig for the webauthn module.

    This class tells Django that there is an application
    named 'webauthn' which contains authentication-related
    APIs (user registration and login).

    这个类用于告诉 Django，本项目中存在一个名为 "webauthn" 的应用模块，
    专门负责用户注册与登录 API。
    """
    default_auto_field = "django.db.models.BigAutoField"
    name = "webauthn"
