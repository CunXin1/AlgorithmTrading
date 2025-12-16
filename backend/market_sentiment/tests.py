from django.test import TestCase
from django.utils import timezone
from django.db import IntegrityError
from datetime import date
from market_sentiment.models import MarketSentiment


class MarketSentimentModelTest(TestCase):
    """Test cases for MarketSentiment model."""

    def setUp(self):
        """Set up test data."""
        self.sentiment = MarketSentiment.objects.create(
            date=date(2024, 1, 15),
            source="cnn",
            index_name="fear_greed_index",
            score=65.5,
            rating="Greed",
            timestamp=timezone.now(),
        )

    def test_sentiment_creation(self):
        """Test that a sentiment record can be created successfully."""
        self.assertEqual(self.sentiment.source, "cnn")
        self.assertEqual(self.sentiment.index_name, "fear_greed_index")
        self.assertEqual(self.sentiment.score, 65.5)
        self.assertEqual(self.sentiment.rating, "Greed")

    def test_sentiment_str_representation(self):
        """Test the string representation of sentiment."""
        expected_str = "2024-01-15 fear_greed_index 65.5"
        self.assertEqual(str(self.sentiment), expected_str)

    def test_sentiment_date_field(self):
        """Test the date field."""
        self.assertEqual(self.sentiment.date, date(2024, 1, 15))

    def test_multiple_indices_same_date(self):
        """Test creating multiple indices for the same date."""
        MarketSentiment.objects.create(
            date=date(2024, 1, 15),
            source="cnn",
            index_name="market_momentum",
            score=70.0,
            rating="Greed",
            timestamp=timezone.now(),
        )
        sentiments = MarketSentiment.objects.filter(date=date(2024, 1, 15))
        self.assertEqual(sentiments.count(), 2)

    def test_unique_together_constraint(self):
        """Test that duplicate (date, source, index_name) raises error."""
        with self.assertRaises(IntegrityError):
            MarketSentiment.objects.create(
                date=date(2024, 1, 15),
                source="cnn",
                index_name="fear_greed_index",  # Same as setUp
                score=50.0,
                rating="Neutral",
                timestamp=timezone.now(),
            )

    def test_sentiment_ordering(self):
        """Test that sentiments are ordered by date."""
        MarketSentiment.objects.create(
            date=date(2024, 1, 10),
            source="cnn",
            index_name="fear_greed_index",
            score=40.0,
            rating="Fear",
            timestamp=timezone.now(),
        )
        MarketSentiment.objects.create(
            date=date(2024, 1, 20),
            source="cnn",
            index_name="fear_greed_index",
            score=75.0,
            rating="Extreme Greed",
            timestamp=timezone.now(),
        )

        sentiments = MarketSentiment.objects.filter(index_name="fear_greed_index")
        dates = list(sentiments.values_list("date", flat=True))
        self.assertEqual(dates, [date(2024, 1, 10), date(2024, 1, 15), date(2024, 1, 20)])

    def test_score_range(self):
        """Test various score values."""
        low_sentiment = MarketSentiment.objects.create(
            date=date(2024, 1, 5),
            source="cnn",
            index_name="fear_greed_index",
            score=10.0,
            rating="Extreme Fear",
            timestamp=timezone.now(),
        )
        self.assertEqual(low_sentiment.score, 10.0)

    def test_different_sources(self):
        """Test creating sentiments from different sources."""
        other_source = MarketSentiment.objects.create(
            date=date(2024, 1, 15),
            source="other",
            index_name="fear_greed_index",
            score=55.0,
            rating="Neutral",
            timestamp=timezone.now(),
        )
        # Should not raise error since source is different
        self.assertEqual(other_source.source, "other")
