import http.client
import json
from market_sentiment.models import MarketSentiment
from market_sentiment.normalizer import normalize_item

RAPIDAPI_HOST = "cnn-fear-and-greed-index.p.rapidapi.com"


SUPPORTED_INDEXES = [
    "fear_and_greed",
    "market_momentum_sp500",
    "market_momentum_sp125",
    "stock_price_strength",
    "stock_price_breadth",
    "put_call_options",
    "market_volatility_vix",
    "market_volatility_vix_50",
    "junk_bond_demand",
    "safe_haven_demand",
]


def fetch_daily_latest():
    """
    Fetch latest daily sentiment data from CNN Fear & Greed API
    and upsert into MarketSentiment table.
    """

    conn = http.client.HTTPSConnection(RAPIDAPI_HOST)

    headers = {
        "x-rapidapi-key": "<YOUR_RAPIDAPI_KEY>",
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    conn.request("GET", "/cnn/v1/fear_and_greed/index", headers=headers)
    res = conn.getresponse()

    if res.status != 200:
        return

    payload = json.loads(res.read().decode("utf-8"))
    data = payload.get("data")

    if not isinstance(data, dict):
        return

    for idx in SUPPORTED_INDEXES:
        item = data.get(idx)
        if not item:
            continue

        try:
            normalized = normalize_item(idx, item)
        except Exception:
            continue

        MarketSentiment.objects.update_or_create(
            index_name=idx,
            date=normalized["date"],
            defaults={
                "score": normalized.get("score"),
                "rating": normalized.get("rating"),
                "timestamp": normalized.get("timestamp"),
                "source": "CNN",
            },
        )
