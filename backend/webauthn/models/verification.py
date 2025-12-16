# webauthn/models/verification.py
"""
Email verification code model.
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta


class EmailVerificationCode(models.Model):
    """
    Stores email verification codes for user registration.
    Codes expire after a configurable time period.
    """

    email = models.EmailField(
        verbose_name="Email Address",
        help_text="The email address to verify",
    )
    code = models.CharField(
        max_length=6,
        verbose_name="Verification Code",
        help_text="6-digit verification code",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At",
    )
    is_used = models.BooleanField(
        default=False,
        verbose_name="Is Used",
        help_text="Whether this code has been used for registration",
    )

    # Code expiration time in minutes
    EXPIRATION_MINUTES = 10

    class Meta:
        verbose_name = "Email Verification Code"
        verbose_name_plural = "Email Verification Codes"
        ordering = ["-created_at"]

    def __str__(self):
        status = "used" if self.is_used else ("expired" if self.is_expired() else "valid")
        return f"{self.email} - {self.code} ({status})"

    def is_expired(self):
        """Check if the verification code has expired."""
        expiration_time = self.created_at + timedelta(minutes=self.EXPIRATION_MINUTES)
        return timezone.now() > expiration_time

    def time_remaining(self):
        """Return the remaining time before expiration, or None if expired."""
        if self.is_expired():
            return None
        expiration_time = self.created_at + timedelta(minutes=self.EXPIRATION_MINUTES)
        return expiration_time - timezone.now()
