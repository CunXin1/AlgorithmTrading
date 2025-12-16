from django.contrib import admin
from webauthn.models import SentimentEmail


@admin.register(SentimentEmail)
class SentimentEmailAdmin(admin.ModelAdmin):
    list_display = ["user", "email", "enabled", "created_at"]
    list_filter = ["enabled", "created_at"]
    search_fields = ["user__username", "user__email", "email"]
    list_editable = ["enabled"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at"]
    raw_id_fields = ["user"]
