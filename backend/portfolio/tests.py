from django.test import TestCase
from portfolio.models import FamousPortfolios
from stock.models import Stock


class FamousPortfoliosModelTest(TestCase):
    """Test cases for FamousPortfolios model."""

    def setUp(self):
        """Set up test data."""
        # Create some stocks
        self.stock1 = Stock.objects.create(
            stock_name="Apple Inc.",
            stock_symbol="AAPL",
        )
        self.stock2 = Stock.objects.create(
            stock_name="Microsoft Corporation",
            stock_symbol="MSFT",
        )
        self.stock3 = Stock.objects.create(
            stock_name="Alphabet Inc.",
            stock_symbol="GOOGL",
        )

        # Create a portfolio
        self.portfolio = FamousPortfolios.objects.create(
            portfolio_name="Warren Buffett Portfolio",
            portfolio_description="Stocks held by Berkshire Hathaway",
        )
        self.portfolio.stocks.add(self.stock1, self.stock2)

    def test_portfolio_creation(self):
        """Test that a portfolio can be created successfully."""
        self.assertEqual(self.portfolio.portfolio_name, "Warren Buffett Portfolio")
        self.assertIsNotNone(self.portfolio.portfolio_description)

    def test_portfolio_str_representation(self):
        """Test the string representation of a portfolio."""
        self.assertEqual(str(self.portfolio), "Warren Buffett Portfolio")

    def test_portfolio_stocks_relationship(self):
        """Test the ManyToMany relationship with stocks."""
        stocks = self.portfolio.stocks.all()
        self.assertEqual(stocks.count(), 2)
        self.assertIn(self.stock1, stocks)
        self.assertIn(self.stock2, stocks)

    def test_add_stock_to_portfolio(self):
        """Test adding a stock to a portfolio."""
        self.portfolio.stocks.add(self.stock3)
        self.assertEqual(self.portfolio.stocks.count(), 3)
        self.assertIn(self.stock3, self.portfolio.stocks.all())

    def test_remove_stock_from_portfolio(self):
        """Test removing a stock from a portfolio."""
        self.portfolio.stocks.remove(self.stock1)
        self.assertEqual(self.portfolio.stocks.count(), 1)
        self.assertNotIn(self.stock1, self.portfolio.stocks.all())

    def test_portfolio_with_image(self):
        """Test creating a portfolio with a base64 image."""
        portfolio_with_img = FamousPortfolios.objects.create(
            portfolio_name="Tech Giants",
            portfolio_img="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        )
        self.assertIsNotNone(portfolio_with_img.portfolio_img)

    def test_portfolio_without_description(self):
        """Test that portfolio_description can be null."""
        portfolio = FamousPortfolios.objects.create(
            portfolio_name="Simple Portfolio",
        )
        self.assertIsNone(portfolio.portfolio_description)

    def test_empty_portfolio(self):
        """Test a portfolio with no stocks."""
        empty_portfolio = FamousPortfolios.objects.create(
            portfolio_name="Empty Portfolio",
        )
        self.assertEqual(empty_portfolio.stocks.count(), 0)

    def test_stock_in_multiple_portfolios(self):
        """Test that a stock can belong to multiple portfolios."""
        another_portfolio = FamousPortfolios.objects.create(
            portfolio_name="Another Portfolio",
        )
        another_portfolio.stocks.add(self.stock1)

        # stock1 should be in both portfolios
        portfolios_with_stock1 = FamousPortfolios.objects.filter(stocks=self.stock1)
        self.assertEqual(portfolios_with_stock1.count(), 2)
