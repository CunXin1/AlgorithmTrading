# finance/urls.py
from django.urls import path
from .views import stock_intraday_view, current_price_view

urlpatterns = [
    # 1. 当前价格（必须放前面，否则被下面的 <symbol> 抢匹配）
    path("currentprice/<str:symbol>/", current_price_view, name="current-price"),

    # 2. 分钟级 K 线数据
    path("<str:symbol>/", stock_intraday_view, name="stock-intraday"),
]

