from django.utils import timezone
from datetime import datetime


def normalize_item(index_name, item):
    """
    Normalize CNN Fear & Greed API item into internal format.
    Handles both 'timestamp' and 'date' fields safely.
    """

    # 1️⃣ Resolve timestamp safely
    if "timestamp" in item and item["timestamp"]:
        ts = item["timestamp"].replace("Z", "+00:00")
        timestamp = datetime.fromisoformat(ts)

    elif "date" in item and item["date"]:
        # date like "2024-12-18"
        timestamp = datetime.fromisoformat(item["date"] + "T00:00:00+00:00")

    else:
        # Absolute fallback (should rarely happen)
        timestamp = timezone.now()

    return {
        "index_name": index_name,
        "timestamp": timestamp,
        "date": timestamp.date(),
        "score": item.get("score"),
        "rating": item.get("rating"),
    }
