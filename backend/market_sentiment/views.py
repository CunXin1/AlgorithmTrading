# market_sentiment/views.py
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Max, Min, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from .models import MarketSentiment
from .serializers import MarketSentimentSerializer

CORE_INDEXES = [
    "fear_and_greed",
    "market_volatility_vix",
    "put_call_options",
]


class SentimentOverview(APIView):
    """
    返回 3 个核心指标的最新值
    """
    def get(self, request):
        result = {}

        for idx in CORE_INDEXES:
            latest = (
                MarketSentiment.objects
                .filter(index_name=idx)
                .order_by("-date")
                .first()
            )
            if latest:
                result[idx] = {
                    "date": latest.date,
                    "score": latest.score,
                    "rating": latest.rating,
                }

        return Response(result)


class SentimentHistory(APIView):
    """
    单个指标的历史时间序列
    """
    def get(self, request, index_name: str):
        days = int(request.GET.get("days", 365))
        start_date = now().date() - timedelta(days=days)

        qs = MarketSentiment.objects.filter(
            index_name=index_name,
            date__gte=start_date,
        ).order_by("date")

        if not qs.exists():
            raise NotFound(f"No data for index '{index_name}'")

        return Response(
            MarketSentimentSerializer(qs, many=True).data
        )


class SentimentMeta(APIView):
    """
    返回每个 index 的数据覆盖情况
    """
    qs = (
        MarketSentiment.objects
        .values("index_name")
        .annotate(
            count=Count("id"),
            first_date=Min("date"),
            last_date=Max("date"),
        )
        .order_by("index_name")
    )

    def get(self, request):
        result = {}

        for item in self.qs:
            result[item["index_name"]] = {
                "count": item["count"],
                "first_date": item["first_date"],
                "last_date": item["last_date"],
            }

        return Response(result)
