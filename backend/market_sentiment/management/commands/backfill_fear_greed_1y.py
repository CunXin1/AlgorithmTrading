# market_sentiment/management/commands/backfill_fear_greed.py
from django.core.management.base import BaseCommand
from market_sentiment.services.fetcher import backfill_if_supported

class Command(BaseCommand):
    help = "Backfill CNN Fear & Greed historical data if supported"

    def handle(self, *args, **kwargs):
        backfill_if_supported()
        self.stdout.write(self.style.SUCCESS("Backfill (if supported) completed"))
