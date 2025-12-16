"""
Service to fetch stock news from Google News RSS feed.

Usage:
    from stock.services import fetch_and_save_stock_news, fetch_and_save_query_news
    
    # Fetch and save news for a stock symbol
    news_items = fetch_and_save_stock_news('AAPL')
    
    # Fetch and save news for a general query
    news_items = fetch_and_save_query_news('Federal Reserve Jerome Powell')
"""

import re
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from typing import List, Dict, Optional
from urllib.parse import quote

from django.utils import timezone

from stock.models import Stock, StockNews


# Google News RSS base URL
GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"

# Maximum number of news items to save per query
MAX_NEWS_ITEMS = 15

# Cache duration in minutes (don't re-fetch if news is recent)
CACHE_DURATION_MINUTES = 30


def fetch_news_from_rss(query: str) -> List[Dict]:
    """
    Fetch news from Google News RSS feed for a given query.
    
    Args:
        query: Search query (e.g., stock symbol or general topic)
        
    Returns:
        List of dicts with title, link, description, pub_date, source
    """
    url = GOOGLE_NEWS_RSS_URL.format(query=quote(query))
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching news for {query}: {e}")
        return []
    
    try:
        root = ET.fromstring(response.content)
    except ET.ParseError as e:
        print(f"Error parsing XML for {query}: {e}")
        return []
    
    news_items = []
    
    # Find all <item> elements in the RSS feed
    for item in root.findall('.//item'):
        title_elem = item.find('title')
        link_elem = item.find('link')
        description_elem = item.find('description')
        pub_date_elem = item.find('pubDate')
        source_elem = item.find('source')
        
        title = title_elem.text if title_elem is not None else ''
        link = link_elem.text if link_elem is not None else ''
        description = description_elem.text if description_elem is not None else ''
        source = source_elem.text if source_elem is not None else ''
        
        # Parse publication date
        pub_date = None
        if pub_date_elem is not None and pub_date_elem.text:
            try:
                pub_date = parsedate_to_datetime(pub_date_elem.text)
            except (ValueError, TypeError):
                pub_date = None
        
        # Clean up description (remove HTML tags if any)
        if description:
            description = re.sub(r'<[^>]+>', '', description)
            description = description.strip()
        
        if title and link:
            news_items.append({
                'title': title[:500],  # Truncate to field max length
                'link': link[:2000],
                'description': description or '',
                'pub_date': pub_date,
                'source': source or ''
            })
        
        # Only keep first MAX_NEWS_ITEMS
        if len(news_items) >= MAX_NEWS_ITEMS:
            break
    
    return news_items


def fetch_and_save_stock_news(symbol: str) -> List[StockNews]:
    """
    Fetch news for a stock symbol and save to database.
    Updates existing news if link already exists.
    
    Args:
        symbol: Stock symbol (e.g., 'AAPL')
        
    Returns:
        List of StockNews objects saved/updated
    """
    symbol = symbol.strip().upper()
    
    # Get or create the stock
    stock, _ = Stock.objects.get_or_create(
        stock_symbol=symbol,
        defaults={'stock_name': symbol}
    )
    
    # Fetch news from RSS
    news_items = fetch_news_from_rss(symbol)
    
    if not news_items:
        return []
    
    saved_news = []
    
    for item in news_items:
        # Use update_or_create to handle duplicates
        news, created = StockNews.objects.update_or_create(
            stock=stock,
            link=item['link'],
            defaults={
                'title': item['title'],
                'description': item['description'],
                'pub_date': item['pub_date']
            }
        )
        saved_news.append(news)
    
    # Clean up old news (keep only the latest MAX_NEWS_ITEMS)
    all_news = StockNews.objects.filter(stock=stock).order_by('-pub_date', '-created_at')
    news_to_keep_ids = list(all_news[:MAX_NEWS_ITEMS].values_list('id', flat=True))
    StockNews.objects.filter(stock=stock).exclude(id__in=news_to_keep_ids).delete()
    
    return saved_news


def fetch_and_save_query_news(query: str) -> List[StockNews]:
    """
    Fetch news for a general search query and save to database.
    Used for non-stock queries like "Federal Reserve Jerome Powell".
    
    Args:
        query: Search query string
        
    Returns:
        List of StockNews objects saved/updated
    """
    query = query.strip()
    
    if not query:
        return []
    
    # Fetch news from RSS
    news_items = fetch_news_from_rss(query)
    
    if not news_items:
        return []
    
    saved_news = []
    
    for item in news_items:
        # Use update_or_create to handle duplicates (by query + link)
        news, created = StockNews.objects.update_or_create(
            query=query,
            link=item['link'],
            stock=None,  # No stock association for general queries
            defaults={
                'title': item['title'],
                'description': item['description'],
                'pub_date': item['pub_date']
            }
        )
        saved_news.append(news)
    
    # Clean up old news for this query (keep only the latest MAX_NEWS_ITEMS)
    all_news = StockNews.objects.filter(query=query, stock__isnull=True).order_by('-pub_date', '-created_at')
    news_to_keep_ids = list(all_news[:MAX_NEWS_ITEMS].values_list('id', flat=True))
    StockNews.objects.filter(query=query, stock__isnull=True).exclude(id__in=news_to_keep_ids).delete()
    
    return saved_news


def get_cached_news(query: str = None, stock: Stock = None) -> Optional[List[StockNews]]:
    """
    Get cached news if it's recent enough.
    
    Args:
        query: Search query (for general news)
        stock: Stock object (for stock-specific news)
        
    Returns:
        List of StockNews if cache is valid, None otherwise
    """
    cache_threshold = timezone.now() - timedelta(minutes=CACHE_DURATION_MINUTES)
    
    if stock:
        news = StockNews.objects.filter(stock=stock)
    elif query:
        news = StockNews.objects.filter(query=query, stock__isnull=True)
    else:
        return None
    
    # Check if we have recent news
    recent_news = news.filter(created_at__gte=cache_threshold)
    if recent_news.exists():
        return list(news.order_by('-pub_date', '-created_at')[:MAX_NEWS_ITEMS])
    
    return None


def fetch_news_for_all_stocks() -> Dict[str, int]:
    """
    Fetch news for all stocks in the database.
    
    Returns:
        Dict mapping stock symbol to number of news items fetched
    """
    results = {}
    
    for stock in Stock.objects.all():
        news_items = fetch_and_save_stock_news(stock.stock_symbol)
        results[stock.stock_symbol] = len(news_items)
    
    return results
