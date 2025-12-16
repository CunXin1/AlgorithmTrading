# webauthn/admin/verification.py
from django.contrib import admin
from django.utils.html import format_html

from webauthn.models import EmailVerificationCode


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    """Admin configuration for EmailVerificationCode model."""

    list_display = [
        "email",
        "code",
        "created_at",
        "is_used",
        "status_display",
    ]
    list_filter = ["is_used", "created_at"]
    search_fields = ["email", "code"]
    readonly_fields = ["created_at", "status_display", "time_remaining_display"]
    ordering = ["-created_at"]

    fieldsets = (
        (None, {
            "fields": ("email", "code", "is_used")
        }),
        ("Status", {
            "fields": ("created_at", "status_display", "time_remaining_display"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Status")
    def status_display(self, obj):
        """Display verification code status with color coding."""
        if obj.is_used:
            return format_html(
                '<span style="color: #999;">✓ Used</span>'
            )
        elif obj.is_expired():
            return format_html(
                '<span style="color: #e74c3c;">✗ Expired</span>'
            )
        else:
            return format_html(
                '<span style="color: #27ae60;">● Valid</span>'
            )

    @admin.display(description="Time Remaining")
    def time_remaining_display(self, obj):
        """Display remaining time before expiration."""
        remaining = obj.time_remaining()
        if remaining is None:
            return "Expired"
        minutes = int(remaining.total_seconds() // 60)
        seconds = int(remaining.total_seconds() % 60)
        return f"{minutes}m {seconds}s"
