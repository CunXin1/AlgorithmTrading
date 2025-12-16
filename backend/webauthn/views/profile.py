# webauthn/views/profile.py
"""
User profile views.
"""
import json

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

from webauthn.models import UserProfile


@login_required
@require_http_methods(["GET", "POST"])
def profile_api(request):
    """
    GET  -> return profile info
    POST -> update username / avatar (base64)
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return JsonResponse({
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "avatar": profile.user_profile_img,
        })

    # POST: update profile
    try:
        body = json.loads(request.body or "{}")
    except Exception:
        return JsonResponse({"error": "invalid json"}, status=400)

    username = body.get("username", "").strip()
    first_name = body.get("first_name")
    last_name = body.get("last_name")
    avatar = body.get("avatar")  # base64 string

    user_updated = False
    if username:
        request.user.username = username
        user_updated = True
    if first_name is not None:
        request.user.first_name = first_name.strip()
        user_updated = True
    if last_name is not None:
        request.user.last_name = last_name.strip()
        user_updated = True
    if user_updated:
        request.user.save()

    if avatar is not None:
        profile.user_profile_img = avatar
        profile.save()

    return JsonResponse({
        "username": request.user.username,
        "email": request.user.email,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
        "avatar": profile.user_profile_img,
    })
