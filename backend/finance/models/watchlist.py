# finance/models/watchlist.py
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class Watchlist(models.Model):
    """
    Per-user watchlist.
    Symbols stored as uppercase strings.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    symbols = models.JSONField(default=list)

    def __str__(self):
        return f"Watchlist({self.user})"
