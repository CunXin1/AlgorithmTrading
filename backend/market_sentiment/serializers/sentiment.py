# market_sentiment/serializers/sentiment.py
from rest_framework import serializers
from ..models import MarketSentiment


class MarketSentimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketSentiment
        fields = [
            "date",
            "index_name",
            "score",
            "rating",
            "timestamp",
        ]
