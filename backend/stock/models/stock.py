from django.db import models

class Stock(models.Model):

    # stock name
    stock_name = models.CharField(max_length=255)

    # stock symbol
    stock_symbol = models.CharField(max_length=255)
    
    # stock img
    stock_img = models.TextField(
        null=True,
        blank=True,
        help_text=(
            "Base64 encoded PNG of the stock's 128*128 avatar. " "No data-URI prefix."
        ),
        verbose_name="stock img (Base64)",
    )

    class Meta:
        verbose_name = "Stock"
        verbose_name_plural = "Stocks"

    def __str__(self):
        return f"{self.stock_name} - {self.stock_symbol}"

