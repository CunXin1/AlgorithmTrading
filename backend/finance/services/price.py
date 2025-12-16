# finance/services/price.py
from __future__ import annotations

from typing import Dict, Any
from datetime import datetime
from zoneinfo import ZoneInfo

from .http_helper import http_get

NY_TZ = ZoneInfo("America/New_York")


def get_current_price(symbol: str) -> Dict[str, Any]:
    """
    使用 intraday（1-minute）数据计算"当前价格"。

    设计原则（非常重要）：
    - ✅ 使用 v8/finance/chart
    - 当前价 = 最近一根 1min K 线的 close
    - 对交易系统来说，这是合理且常见做法

    返回格式（与前端契约）：
    {
        "symbol": "AAPL",
        "price": 279.50,
        "time": "2025-12-15T09:34",
        "market_state": "RTH"
    }
    """

    symbol = symbol.upper()

    # Yahoo Finance chart API（1-minute）
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"

    params = {
        "interval": "1m",
        "range": "1d",
        "includePrePost": "true",
    }

    js = http_get(url, params=params)

    # -------- 解析 Yahoo chart 返回 --------
    chart = js.get("chart", {})
    result = chart.get("result")

    if not result:
        return {
            "symbol": symbol,
            "price": None,
            "time": None,
            "market_state": None,
        }

    r0 = result[0]

    timestamps = r0.get("timestamp")
    indicators = r0.get("indicators", {})
    quote = indicators.get("quote", [{}])[0]

    closes = quote.get("close")

    if not timestamps or not closes:
        return {
            "symbol": symbol,
            "price": None,
            "time": None,
            "market_state": None,
        }

    # -------- 取最后一根有效 K 线 --------
    # Yahoo 有时最后一个 close 是 None（正在形成）
    idx = len(closes) - 1
    while idx >= 0 and closes[idx] is None:
        idx -= 1

    if idx < 0:
        return {
            "symbol": symbol,
            "price": None,
            "time": None,
            "market_state": None,
        }

    price = closes[idx]
    ts = timestamps[idx]

    # -------- 时间转换（NY 时区）--------
    try:
        t_ny = datetime.fromtimestamp(ts, tz=NY_TZ)
        time_str = t_ny.strftime("%Y-%m-%dT%H:%M")
    except Exception:
        time_str = None

    # -------- 市场状态判断（简化版）--------
    # 你 intraday API 本身已经区分 RTH / Pre / Post
    market_state = "RTH"

    return {
        "symbol": symbol,
        "price": float(price),
        "time": time_str,
        "market_state": market_state,
    }
