# authapi/urls.py
from django.urls import path
from .views import (
    register_view,
    login_view,
    logout_view,
    send_verification_code,
    me_view,
)

urlpatterns = [
    path("register/", register_view),
    path("login/", login_view),
    path("logout/", logout_view),
    path("send-code/", send_verification_code, name="auth-send-code"),
    path("me/", me_view, name="auth-me"),
]
