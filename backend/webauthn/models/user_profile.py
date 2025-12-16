# webauthn/models/user_profile.py
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    # foreign key to django user model
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # user profile image (base64 encoded png 128*128)
    user_profile_img = models.TextField(
        null=True,
        blank=True,
        help_text=(
            "Base64 encoded PNG of the user's 128*128 avatar. " "No data-URI prefix."
        ),
        verbose_name="avatar (Base64)",
    )

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return self.user.username