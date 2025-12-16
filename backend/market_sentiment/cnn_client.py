# market_sentiment/services/cnn_client.py
import http.client
import json
import os

HOST = "cnn-fear-and-greed-index.p.rapidapi.com"

def _request(path: str):
    conn = http.client.HTTPSConnection(HOST, timeout=15)
    headers = {
        "x-rapidapi-key": os.getenv("RAPIDAPI_KEY"),
        "x-rapidapi-host": HOST,
    }
    conn.request("GET", path, headers=headers)
    res = conn.getresponse()
    raw = res.read()
    return res.status, raw


def fetch_index_latest(index_name: str) -> dict:
    status, raw = _request(f"/cnn/v1/{index_name}/index")
    if status != 200:
        raise RuntimeError(f"{index_name} latest failed: {status}")
    return json.loads(raw.decode("utf-8"))


def fetch_index_historical(index_name: str) -> list[dict] | None:
    """
    如果 index 支持 historical，返回 list
    如果不支持（404），返回 None
    """
    status, raw = _request(f"/cnn/v1/{index_name}/historical?order=desc")

    if status == 404:
        return None
    if status != 200:
        raise RuntimeError(f"{index_name} historical failed: {status}")

    data = json.loads(raw.decode("utf-8"))
    return data.get("data", [])
