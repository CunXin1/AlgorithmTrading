# finance/http_helper.py
# ------------------------------------------------------------
# 通用 HTTP GET 工具（带重试和“反缓存”参数）
# 对应 Node 版本的 httpHelper.js
# ------------------------------------------------------------

import time
from typing import Any, Dict, Optional

import requests

# 全局请求头（Headers），伪装浏览器 User-Agent
HEADERS: Dict[str, str] = {
    "User-Agent": "Mozilla/5.0"
}


def http_get(
    url: str,
    params: Optional[Dict[str, Any]] = None,
    retries: int = 3,
    delay: float = 0.6,  # 秒，对应 JS 的 600ms
) -> Dict[str, Any]:
    """
    通用 HTTP GET 工具函数（带重试与反缓存）

    :param url: 请求 URL
    :param params: 查询参数字典
    :param retries: 重试次数
    :param delay: 每次重试之间等待的秒数
    :return: 解析后的 JSON 响应（dict）
    :raises RuntimeError: 多次重试失败
    """
    if params is None:
        params = {}

    last_err: Optional[Exception] = None

    for _ in range(retries):
        try:
            # 反缓存参数 "_"（等价于 JS 里的 Date.now()）
            full_params = dict(params)
            full_params["_"] = int(time.time() * 1000)

            resp = requests.get(
                url,
                params=full_params,
                headers=HEADERS,
                timeout=10,  # 10 秒超时
            )
            resp.raise_for_status()  # HTTP 状态码不是 2xx 会抛异常

            js = resp.json()

            # 验证是否符合 Yahoo Finance（chart.result 非空）
            if (
                isinstance(js, dict)
                and js.get("chart")
                and js["chart"].get("result")
                and len(js["chart"]["result"]) > 0
            ):
                return js

            # 如果结构不对，也视为失败，进入重试
            last_err = RuntimeError("Invalid Yahoo Finance response structure")
        except Exception as e:
            last_err = e
            time.sleep(delay)

    # 所有重试失败
    raise RuntimeError(f"HTTP request failed: {last_err}")
