from django.test import TestCase
from django.contrib.auth.models import User
from stock.models import Stock, WatchList


class StockModelTest(TestCase):
    """Test cases for Stock model."""

    def setUp(self):
        """Set up test data."""
        self.stock = Stock.objects.create(
            stock_name="Apple Inc.",
            stock_symbol="AAPL",
        )

    def test_stock_creation(self):
        """Test that a stock can be created successfully."""
        self.assertEqual(self.stock.stock_name, "Apple Inc.")
        self.assertEqual(self.stock.stock_symbol, "AAPL")

    def test_stock_str_representation(self):
        """Test the string representation of a stock."""
        expected_str = "Apple Inc. - AAPL"
        self.assertEqual(str(self.stock), expected_str)

    def test_stock_with_image(self):
        """Test creating a stock with a base64 image."""
        stock_with_img = Stock.objects.create(
            stock_name="Microsoft Corporation",
            stock_symbol="MSFT",
            stock_img="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        )
        self.assertIsNotNone(stock_with_img.stock_img)
        self.assertEqual(stock_with_img.stock_symbol, "MSFT")

    def test_stock_without_image(self):
        """Test that stock_img can be null."""
        stock = Stock.objects.create(
            stock_name="Google",
            stock_symbol="GOOGL",
        )
        self.assertIsNone(stock.stock_img)

    def test_stock_unique_retrieval(self):
        """Test retrieving a stock by symbol."""
        retrieved_stock = Stock.objects.get(stock_symbol="AAPL")
        self.assertEqual(retrieved_stock.stock_name, "Apple Inc.")


class WatchListModelTest(TestCase):
    """Test cases for WatchList model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123",
        )
        self.stock1 = Stock.objects.create(
            stock_name="Apple Inc.",
            stock_symbol="AAPL",
        )
        self.stock2 = Stock.objects.create(
            stock_name="Microsoft Corporation",
            stock_symbol="MSFT",
        )
        self.watchlist = WatchList.objects.create(user=self.user)
        self.watchlist.stocks.add(self.stock1)

    def test_watchlist_creation(self):
        """Test that a watchlist can be created successfully."""
        self.assertEqual(self.watchlist.user, self.user)

    def test_watchlist_stocks_relationship(self):
        """Test the ManyToMany relationship with stocks."""
        stocks = self.watchlist.stocks.all()
        self.assertEqual(stocks.count(), 1)
        self.assertIn(self.stock1, stocks)

    def test_add_stock_to_watchlist(self):
        """Test adding a stock to a watchlist."""
        self.watchlist.stocks.add(self.stock2)
        self.assertEqual(self.watchlist.stocks.count(), 2)
        self.assertIn(self.stock2, self.watchlist.stocks.all())

    def test_remove_stock_from_watchlist(self):
        """Test removing a stock from a watchlist."""
        self.watchlist.stocks.remove(self.stock1)
        self.assertEqual(self.watchlist.stocks.count(), 0)

    def test_one_to_one_user_constraint(self):
        """Test that a user can only have one watchlist."""
        with self.assertRaises(Exception):
            WatchList.objects.create(user=self.user)

    def test_watchlist_cascade_delete(self):
        """Test that watchlist is deleted when user is deleted."""
        user_id = self.user.id
        self.user.delete()
        watchlist_count = WatchList.objects.filter(user_id=user_id).count()
        self.assertEqual(watchlist_count, 0)
