# webauthn/urls.py
from django.urls import path
from . import views

app_name = "webauthn"

urlpatterns = [
    # CSRF
    path("webauthn/csrf/", views.csrf_token_view, name="csrf"),

    # Authentication
    path("webauthn/register/", views.register_view, name="register"),
    path("webauthn/login/", views.login_view, name="login"),
    path("webauthn/logout/", views.logout_view, name="logout"),
    path("webauthn/send-code/", views.send_verification_code, name="send-code"),
    path("webauthn/current-user/", views.me_view, name="current-user"),

    # User Profile
    path("webauthn/current-user/profile/", views.profile_api, name="current-user-profile"),

    # Sentiment Email Subscriptions
    path("webauthn/current-user/sentiment-emails/", views.sentiment_email_api, name="current-user-sentiment-emails"),
]
