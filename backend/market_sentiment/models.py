# market_sentiment/models.py
from django.db import models

class MarketSentiment(models.Model):
    date = models.DateField()                       # 指标对应日期
    source = models.CharField(max_length=20)        # cnn
    index_name = models.CharField(max_length=50)    # 10 个指标之一
    score = models.FloatField()
    rating = models.CharField(max_length=20)
    timestamp = models.DateTimeField()              # API 给的时间戳

    class Meta:
        unique_together = ("date", "source", "index_name")
        indexes = [
            models.Index(fields=["date", "index_name"]),
        ]
        ordering = ["date"]

    def __str__(self):
        return f"{self.date} {self.index_name} {self.score}"


class AlertSubscription(models.Model):
    email = models.EmailField(unique=True)
    enabled = models.BooleanField(default=True)

    last_state = models.CharField(
        max_length=20,
        default="NORMAL"
    )

    last_panic_sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
# user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
