# finance/views.py
# ------------------------------------------------------------
# 等价于 stockRoutes.js / fetchStockData 接口部分
# GET /api/stocks/<symbol>?date=YYYY-MM-DD
# ------------------------------------------------------------

from typing import Any, Dict

from django.http import JsonResponse, HttpRequest
from .services import fetch_intraday


def stock_intraday_view(request: HttpRequest, symbol: str) -> JsonResponse:
    """
    获取指定股票的 1m 盘中数据（RTH only）
    路由：GET /api/stocks/<symbol>?date=YYYY-MM-DD
    """

    try:
        symbol_upper = symbol.upper()
        date_str = request.GET.get("date")  # 例如 "2025-12-10" 或 None

        data = fetch_intraday(symbol_upper, date_str)

        resp: Dict[str, Any] = {
            "symbol": symbol_upper,
            "timezone": "America/New_York",
            "interval": "1m",
            "session": "RTH (09:30–16:00)",
            "count": len(data),
            "data": data,
        }
        return JsonResponse(resp, status=200, json_dumps_params={"ensure_ascii": False})
    except Exception as e:
        # 完整保留你 Node 里的 500 行为
        return JsonResponse(
            {"error": str(e)},
            status=500,
            json_dumps_params={"ensure_ascii": False},
        )
