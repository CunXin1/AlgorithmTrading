from django.db import models
from django.contrib.auth.models import User
from .stock import Stock


class WatchList(models.Model):
    """User's stock watchlist - each user has one watchlist."""

    # foreign key to django user model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='watchlist')

    # watch list stocks
    stocks = models.ManyToManyField(Stock, blank=True)

    class Meta:
        verbose_name = "Watch List"
        verbose_name_plural = "Watch Lists"

    def __str__(self):
        return f"{self.user.username} - {self.stocks.count()} stocks"