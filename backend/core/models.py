# core/models.py
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class UserProfile(models.Model):
    """
    Core user profile (display info).
    Password & auth handled by Django User.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=50, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.display_name or self.user.username


class Watchlist(models.Model):
    """
    Per-user watchlist.
    Symbols stored as uppercase strings.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    symbols = models.JSONField(default=list)

    def __str__(self):
        return f"Watchlist({self.user})"

class EmailSubscription(models.Model):
    """
    Market sentiment email subscription.
    Each user can have up to N emails (enforced in view).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField()
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    last_state = models.CharField(max_length=32, default="NORMAL")
    last_panic_sent_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("user", "email")   # ✅ 防止重复订阅
        indexes = [
            models.Index(fields=["enabled"]), # ✅ 后面发邮件会用
        ]

    def __str__(self):
        return f"{self.email} ({'on' if self.enabled else 'off'})"



class Portfolio(models.Model):
    """
    User-created portfolio (container only for now).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


def default_portfolio1():
    return {
        "name": "Portfolio 1",
        "holdings": [
            {"symbol": "AAPL", "shares": 1, "buy_price": None},
            {"symbol": "GOOGL", "shares": 1, "buy_price": None},
            {"symbol": "NVDA", "shares": 1, "buy_price": None},
        ],
    }


def default_portfolio2():
    return {
        "name": "Portfolio 2",
        "holdings": [
            {"symbol": "TSLA", "shares": 1, "buy_price": None},
            {"symbol": "PLTR", "shares": 1, "buy_price": None},
            {"symbol": "AMD", "shares": 1, "buy_price": None},
        ],
    }


class Portfolio(models.Model):
    """
    User-created portfolio (max 2 per user).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    
    portfolio1 = models.JSONField(default=default_portfolio1, blank=True)
    portfolio2 = models.JSONField(default=default_portfolio2, blank=True)


    # ✅ 真正的资产数据
    holdings = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "name")

    def __str__(self):
        return f"{self.user} - {self.name}"
