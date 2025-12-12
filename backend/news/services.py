import requests
from xml.etree import ElementTree

def fetch_google_news(symbol: str, limit=6):
    query = f"{symbol} stock"
    url = (
        "https://news.google.com/rss/search"
        f"?q={query}&hl=en-US&gl=US&ceid=US:en"
    )

    resp = requests.get(url, timeout=8)
    resp.raise_for_status()

    root = ElementTree.fromstring(resp.text)
    items = root.findall(".//item")

    results = []
    for item in items[:limit]:
        results.append({
            "title": item.findtext("title"),
            "link": item.findtext("link"),
            "source": item.findtext("source"),
            "published": item.findtext("pubDate"),
        })

    return results
