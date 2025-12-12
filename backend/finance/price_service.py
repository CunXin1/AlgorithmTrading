# finance/price_service.py

from __future__ import annotations
from typing import Dict, Any
from datetime import datetime
from zoneinfo import ZoneInfo

from .http_helper import http_get
from .http_helper import http_get1

NY_TZ = ZoneInfo("America/New_York")


def get_current_price(symbol: str) -> Dict[str, Any]:
    """
    返回最新实时价格（包括盘前/盘后）：
    {
       "symbol": "NVDA",
       "price": 185.22,
       "time": "2025-12-11T03:48",
       "market_state": "POST"
    }
    """

    url = "https://query1.finance.yahoo.com/v7/finance/quote"
    params = {"symbols": symbol}

    js = http_get1(url, params=params)

    quote = js["quoteResponse"]["result"][0]

    market_state = quote.get("marketState")

    # 两种价格来源：常规 / 盘前盘后
    if market_state == "PRE" and quote.get("preMarketPrice") is not None:
        price = quote["preMarketPrice"]
        ts = quote.get("preMarketTime")
    elif market_state in ("POST", "POSTPOST") and quote.get("postMarketPrice") is not None:
        price = quote["postMarketPrice"]
        ts = quote.get("postMarketTime")
    else:
        price = quote.get("regularMarketPrice")
        ts = quote.get("regularMarketTime")

    # 时间戳转换
    if ts:
        t_ny = datetime.fromtimestamp(ts, tz=NY_TZ)
        time_str = t_ny.strftime("%Y-%m-%dT%H:%M")
    else:
        time_str = None

    return {
        "symbol": symbol.upper(),
        "price": float(f"{price:.2f}") if price is not None else None,
        "time": time_str,
        "market_state": market_state,
    }
