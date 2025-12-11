# authapi/urls.py
from django.urls import path
from .views import RegisterView, LoginView

urlpatterns = [
    # POST /api/auth/register
    path("register", RegisterView.as_view(), name="auth-register"),

    # POST /api/auth/login
    path("login", LoginView.as_view(), name="auth-login"),
]
