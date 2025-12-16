from django.db import models
from stock.models import Stock

class FamousPortfolios(models.Model):

    # portfolio name
    portfolio_name = models.CharField(max_length=255)

    # portfolio img
    portfolio_img = models.TextField(
        null=True,
        blank=True,
        help_text=(
            "Base64 encoded PNG of the portfolio's 128*128 avatar. " "No data-URI prefix."
        ),
        verbose_name="portfolio img (Base64)",
    )

    # portfolio description
    portfolio_description = models.TextField(null=True, blank=True)

    # portfolio stocks
    stocks = models.ManyToManyField(Stock)

    class Meta:
        verbose_name = "Famous Portfolio"
        verbose_name_plural = "Famous Portfolios"

    def __str__(self):
        return self.portfolio_name