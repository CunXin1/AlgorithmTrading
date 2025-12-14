from django.conf import settings
from django.db import models

class Watchlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    symbols = models.JSONField(default=list)
