# finance/services/intraday.py
# ------------------------------------------------------------
# Yahoo Finance 数据服务（等价于 yahooService.js）
# 提供 fetch_intraday() 获取 1m 盘中数据（只保留 RTH）
# ------------------------------------------------------------

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, date, time as dtime, timedelta
from typing import List, Optional, Dict, Any

from zoneinfo import ZoneInfo  # Python 3.9+ 推荐
from .http_helper import http_get


# 常量定义
BASE = "https://query1.finance.yahoo.com/v8/finance/chart/"
NY_TZ = ZoneInfo("America/New_York")
INTERVAL = "1m"
RANGE = "1d"


@dataclass
class IntradayBar:
    time: str      # "YYYY-MM-DDTHH:mm"
    open: Optional[float]
    high: Optional[float]
    low: Optional[float]
    close: Optional[float]
    volume: int


def _format_price(x: Optional[float]) -> Optional[float]:
    """价格保留 2 位小数，等价 JS 的 toFixed(2) + Number(...)"""
    if x is None:
        return None
    return float(f"{x:.2f}")


def fetch_intraday(symbol: str, date_str: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    获取 1 分钟盘中数据（只保留常规交易时段 RTH: 09:30–16:00）

    :param symbol: 股票代码，例如 "AAPL"
    :param date_str: 日期字符串 "YYYY-MM-DD"，可选
    :return: 标准化的 K 线数组（list[dict]），字段与 Node 版本完全一致
    """

    # 构造 URL + 基础参数
    url = f"{BASE}{symbol}"
    params: Dict[str, Any] = {"interval": INTERVAL}

    # 根据是否提供 date 决定使用 period1/period2 还是 range=1d
    if date_str:
        # 将 YYYY-MM-DD 转为纽约时间 09:30 ~ 16:00（+2min buffer）
        trading_date: date = datetime.strptime(date_str, "%Y-%m-%d").date()

        open_local = datetime.combine(trading_date, dtime(9, 30), tzinfo=NY_TZ)
        close_local = datetime.combine(trading_date, dtime(16, 0), tzinfo=NY_TZ) + timedelta(minutes=2)

        params["period1"] = int(open_local.timestamp())
        params["period2"] = int(close_local.timestamp())
    else:
        params["range"] = RANGE

    # 请求 Yahoo Finance
    js = http_get(url, params=params)

    # 解析结构
    result = js["chart"]["result"][0]
    timestamps = result.get("timestamp") or []
    quote = (result.get("indicators") or {}).get("quote") or [{}]
    quote0 = quote[0]

    opens = quote0.get("open") or []
    highs = quote0.get("high") or []
    lows = quote0.get("low") or []
    closes = quote0.get("close") or []
    volumes = quote0.get("volume") or []

    bars: List[IntradayBar] = []

    # 遍历每一个时间点，做 RTH 过滤 + 格式化
    for i, ts in enumerate(timestamps):
        # ts 是秒级 UNIX 时间戳
        t_ny = datetime.fromtimestamp(ts, tz=NY_TZ)

        hour = t_ny.hour
        minute = t_ny.minute

        # 只保留 RTH: 09:30–16:00（含 16:00）
        is_rth = (
            (hour > 9 or (hour == 9 and minute >= 30))
            and (hour < 16 or (hour == 16 and minute == 0))
        )
        if not is_rth:
            continue

        time_str = t_ny.strftime("%Y-%m-%dT%H:%M")

        # 各价格数组可能 None 或短于 timestamps，因此要防御性取值
        o = opens[i] if i < len(opens) else None
        h = highs[i] if i < len(highs) else None
        l = lows[i] if i < len(lows) else None
        c = closes[i] if i < len(closes) else None
        v_raw = volumes[i] if i < len(volumes) else 0

        bar = IntradayBar(
            time=time_str,
            open=_format_price(o),
            high=_format_price(h),
            low=_format_price(l),
            close=_format_price(c),
            volume=int(v_raw or 0),
        )
        bars.append(bar)

    # 返回 JS 里 data.filter(Boolean) 之后的结果：list[dict]
    return [bar.__dict__ for bar in bars]
