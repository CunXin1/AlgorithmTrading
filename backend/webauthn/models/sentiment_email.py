from django.db import models
from django.contrib.auth.models import User


class SentimentEmail(models.Model):
    """
    Stores email subscriptions for market sentiment alerts.
    Each user can have up to 3 email subscriptions.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sentiment_emails")
    email = models.EmailField(max_length=255)
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sentiment Email"
        verbose_name_plural = "Sentiment Emails"
        unique_together = ["user", "email"]
        ordering = ["created_at"]

    def __str__(self):
        status = "✓" if self.enabled else "✗"
        return f"{self.user.username} - {self.email} [{status}]"