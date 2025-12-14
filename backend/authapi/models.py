# authapi/models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta


class EmailVerificationCode(models.Model):
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=10)

    class Meta:
        ordering = ["-created_at"]
