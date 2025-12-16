// ------------------------------------------------------------
// HomePage.jsx
// ------------------------------------------------------------
// Main landing page of the AlgorithmTrading platform.
// Contains:
// - TradingView embedded chart (QQQ)
// - Search bar to input stock symbols
// - Recommended "To Buy" stock buttons
// - News section (placeholder for now)
// - Footer with contact and copyright
// ------------------------------------------------------------

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TradingViewChart from "../components/charts/TradingviewChart.jsx";
import RightSidebar from "../components/common/RightSidebar.jsx";
import "../styles/layout.css";
import NewsPanel from "../components/news/NewsPanel.jsx";
import { useWatchlist } from "../context/WatchlistContext";

const TRENDING = ["NVDA", "AVGO", "PLTR", "META", "AMD", "TSLA", "AMZN"];
const RECOMMENDED = ["AAPL", "NVDA", "TSLA", "AMZN", "MSFT"];

export default function HomePage() {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("QQQ");
  const [input, setInput] = useState("");

  // ✅ 全站唯一 watchlist 来源（Context）
  const { watchlist, add, remove } = useWatchlist();

  const normalizedTrending = useMemo(
    () => Array.from(new Set(TRENDING.map((s) => s.toUpperCase()))),
    []
  );

  // 搜索股票：更新图表 + 跳转 stock 页面（不清空输入）
  const handleSearch = (e) => {
    e.preventDefault();
    const formatted = input.trim().toUpperCase();
    if (!formatted) return;

    setSymbol(formatted);
    navigate(`/stock/${formatted.toLowerCase()}`);
  };

  // 推荐股票按钮点击：跳转 stock 页面
  const handleSelect = (sym) => {
    const s = String(sym).trim().toUpperCase();
    if (!s) return;
    setSymbol(s);
    navigate(`/stock/${s.toLowerCase()}`);
  };

  return (
    <div className="homepage">

      {/* ✅ Search bar：页面级，全宽 */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search Stock"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
          <button
            type="button"
            className="search-btn secondary"
            onClick={() => add(input || symbol)}
          >
            + Watchlist
          </button>
        </form>
      </section>

      {/* 主体布局：左 2/3 + 右 1/3 */}
      <div className="home-layout">
        <div className="home-left">

          {/* TradingView 图表 */}
          <section className="chart-section">
            <div className="home-chart-shell">
              <TradingViewChart symbol={symbol} />
            </div>
          </section>

        </div>

        {/* Right Sidebar（已接 Context，不再传 watchlist props） */}
        <RightSidebar trending={TRENDING} />
      </div>

      {/* News Section */}
      <section className="news-section">
        <h3>Market News</h3>
        <NewsPanel symbol={symbol} />
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Contact us: support@algorithmtrading.com</p>
        <p>© 2025 Ruibo Sun. All rights reserved.</p>
      </footer>
    </div>
  );
}
