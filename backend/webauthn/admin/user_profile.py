# webauthn/admin/user_profile.py
import base64
from io import BytesIO

from django import forms
from django.contrib import admin
from django.utils.html import format_html

from webauthn.models import UserProfile

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


class UserProfileAdminForm(forms.ModelForm):
    """Custom form for UserProfile admin with file upload support."""

    avatar_upload = forms.ImageField(
        required=False,
        label="Upload Avatar",
        help_text="Upload an image file. It will be resized to 128x128 and converted to Base64.",
    )

    class Meta:
        model = UserProfile
        fields = "__all__"

    def save(self, commit=True):
        instance = super().save(commit=False)

        uploaded_file = self.cleaned_data.get("avatar_upload")
        if uploaded_file:
            # Process uploaded image
            if HAS_PIL:
                # Open and resize image using PIL
                img = Image.open(uploaded_file)
                img = img.convert("RGBA")
                img = img.resize((128, 128), Image.LANCZOS)

                # Convert to PNG and encode as Base64
                buffer = BytesIO()
                img.save(buffer, format="PNG")
                img_bytes = buffer.getvalue()
            else:
                # No PIL, just read raw bytes (no resize)
                img_bytes = uploaded_file.read()

            # Encode to Base64 string (no data-URI prefix)
            instance.user_profile_img = base64.b64encode(img_bytes).decode("utf-8")

        if commit:
            instance.save()
        return instance


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin configuration for UserProfile model."""

    form = UserProfileAdminForm
    list_display = ["user", "user_email", "has_avatar"]
    search_fields = ["user__username", "user__email"]
    readonly_fields = ["avatar_preview"]

    fieldsets = (
        (None, {
            "fields": ("user",)
        }),
        ("Avatar", {
            "fields": ("avatar_upload", "user_profile_img", "avatar_preview"),
            "description": "Upload an image or paste Base64 directly.",
        }),
    )

    @admin.display(description="Email")
    def user_email(self, obj):
        """Display user's email."""
        return obj.user.email

    @admin.display(description="Has Avatar", boolean=True)
    def has_avatar(self, obj):
        """Check if user has an avatar."""
        return bool(obj.user_profile_img)

    @admin.display(description="Avatar Preview")
    def avatar_preview(self, obj):
        """Display avatar preview in admin."""
        if obj.user_profile_img:
            return format_html(
                '<img src="data:image/png;base64,{}" '
                'style="max-width: 128px; max-height: 128px; border-radius: 8px;" />',
                obj.user_profile_img
            )
        return "No avatar uploaded"
