from django.db import models
from stock.models import Stock


class StockNews(models.Model):
    """
    Model to store news items fetched from Google News RSS.
    
    Can be associated with a stock symbol OR a general search query.
    """

    # Foreign key to stock model (optional for general searches)
    stock = models.ForeignKey(
        Stock, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='news'
    )

    # Search query for general news (e.g., "Federal Reserve Jerome Powell")
    query = models.CharField(max_length=255, blank=True, default='')

    # News title
    title = models.CharField(max_length=500)

    # News link URL
    link = models.URLField(max_length=2000)

    # News description/summary
    description = models.TextField(blank=True, default='')

    # Publication date from RSS feed
    pub_date = models.DateTimeField(null=True, blank=True)

    # When this record was created
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Stock News"
        verbose_name_plural = "Stock News"
        ordering = ['-pub_date', '-created_at']

    def __str__(self):
        if self.stock:
            return f"{self.stock.stock_symbol} - {self.title[:50]}"
        return f"{self.query[:20]} - {self.title[:50]}"
