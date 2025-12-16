"""
Django management command to fetch stock news from Google News RSS.

Usage:
    # Fetch news for a specific stock symbol
    python manage.py fetch_stock_news AAPL
    
    # Fetch news for multiple symbols
    python manage.py fetch_stock_news AAPL GOOGL MSFT
    
    # Fetch news for all stocks in database
    python manage.py fetch_stock_news --all
"""

from django.core.management.base import BaseCommand, CommandError
from stock.models import Stock
from stock.services import fetch_and_save_stock_news


class Command(BaseCommand):
    help = 'Fetch stock news from Google News RSS feed'

    def add_arguments(self, parser):
        parser.add_argument(
            'symbols',
            nargs='*',
            type=str,
            help='Stock symbols to fetch news for (e.g., AAPL GOOGL)'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Fetch news for all stocks in database'
        )

    def handle(self, *args, **options):
        symbols = options['symbols']
        fetch_all = options['all']
        
        if fetch_all:
            # Fetch for all stocks in database
            stocks = Stock.objects.all()
            if not stocks.exists():
                self.stdout.write(
                    self.style.WARNING('No stocks found in database')
                )
                return
            
            symbols = list(stocks.values_list('stock_symbol', flat=True))
            self.stdout.write(f'Fetching news for {len(symbols)} stocks...')
        
        if not symbols:
            raise CommandError(
                'Please provide stock symbols or use --all flag'
            )
        
        total_news = 0
        
        for symbol in symbols:
            symbol = symbol.strip().upper()
            self.stdout.write(f'Fetching news for {symbol}...')
            
            try:
                news_items = fetch_and_save_stock_news(symbol)
                count = len(news_items)
                total_news += count
                
                if count > 0:
                    self.stdout.write(
                        self.style.SUCCESS(f'  ✓ Saved {count} news items for {symbol}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'  - No news found for {symbol}')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Error fetching {symbol}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nTotal: {total_news} news items saved')
        )
