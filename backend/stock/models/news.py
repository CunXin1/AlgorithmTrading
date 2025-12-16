from django.db import models
from stock.models import Stock


class StockNews(models.Model):

    # foreign key to stock model
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)

    # news title
    news_title = models.CharField(max_length=255)

    # news content
    news_content = models.TextField()

    # news date
    news_date = models.DateTimeField()

    class Meta:
        verbose_name = "Stock News"
        verbose_name_plural = "Stock News"

    def __str__(self):
        return f"{self.stock.stock_name} - {self.news_title}"