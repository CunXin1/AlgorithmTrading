# core/admin.py
from django.contrib import admin
from .models import UserProfile, Watchlist, EmailSubscription, Portfolio

admin.site.register(UserProfile)
admin.site.register(Watchlist)
admin.site.register(EmailSubscription)
admin.site.register(Portfolio)
