from django.core.management.base import BaseCommand
from market_sentiment.fetcher import fetch_daily_latest
from market_sentiment.models import AlertSubscription, MarketSentiment
from market_sentiment.alert_logic import classify, handle_alert


class Command(BaseCommand):
    help = "Fetch daily CNN Fear & Greed data and trigger alerts"

    def handle(self, *args, **kwargs):
        # 1️⃣ Fetch and store today's Fear & Greed data
        fetch_daily_latest()

        # 2️⃣ Get today's Fear & Greed score from DB
        latest = (
            MarketSentiment.objects
            .filter(index_name="fear_and_greed")
            .order_by("-date")
            .first()
        )

        if not latest:
            self.stdout.write(self.style.WARNING("No Fear & Greed data found."))
            return

        today_fg_score = latest.score

        # 3️⃣ Classify market state
        state = classify(today_fg_score)

        # 4️⃣ Run alert checks
        subscriptions = AlertSubscription.objects.filter(enabled=True)

        for sub in subscriptions:
            handle_alert(sub, state)

        self.stdout.write(
            self.style.SUCCESS(
                f"Daily update completed. F&G={today_fg_score:.2f}, state={state}"
            )
        )
