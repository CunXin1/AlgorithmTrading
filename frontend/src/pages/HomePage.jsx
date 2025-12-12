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

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TradingViewChart from "../components/TradingviewChart.jsx";
import RightSidebar from "../components/RightSidebar.jsx";
import "../styles/layout.css";
import NewsPanel from "../components/NewsPanel.jsx";


const TRENDING = ["NVDA", "AVGO", "PLTR", "META", "AMD", "TSLA", "AMZN"];
const RECOMMENDED = ["AAPL", "NVDA", "TSLA", "AMZN", "MSFT"];
const LS_KEY = "algorithmtrading_watchlist_v1";

export default function HomePage() {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("QQQ");
  const [input, setInput] = useState("");
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((s) => String(s).trim().toUpperCase())
          .filter(Boolean);
        setWatchlist(Array.from(new Set(cleaned)));
      }
    } catch {
      // ignore bad storage
    }
  }, []);

  // Persist watchlist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(watchlist));
    } catch {
      // ignore quota/blocked storage
    }
  }, [watchlist]);

  const normalizedTrending = useMemo(
    () => Array.from(new Set(TRENDING.map((s) => s.toUpperCase()))),
    []
  );

  const addToWatchlist = (sym) => {
    const s = String(sym).trim().toUpperCase();
    if (!s) return;
    setWatchlist((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const removeFromWatchlist = (sym) => {
    const s = String(sym).trim().toUpperCase();
    setWatchlist((prev) => prev.filter((x) => x !== s));
  };

  // 搜索股票函数：更新图表 +（可选）加入 watchlist + 跳转到 stock 页面
  const handleSearch = (e) => {
    e.preventDefault();
    const formatted = input.trim().toUpperCase();
    if (!formatted) return;

    setSymbol(formatted);
    setInput("");

    // 你要“点进去跳 stock 页面”：搜索就直接跳
    navigate(`/stock/${formatted.toLowerCase()}`);
  };

  // 推荐股票按钮点击：跳转 stock 页面（同时更新当前图表 symbol）
  const handleSelect = (sym) => {
    const s = String(sym).trim().toUpperCase();
    if (!s) return;
    setSymbol(s);
    navigate(`/stock/${s.toLowerCase()}`);
  };

  return (
    <div className="homepage">

  {/* ✅ Search bar：页面级，全宽（和 StockPage 一致） */}
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
        onClick={() => addToWatchlist(currentSymbol)}
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

    {/* Right Sidebar */}
    <RightSidebar
      trending={TRENDING}
      watchlist={watchlist}
      onAddToWatchlist={addToWatchlist}
      onRemoveFromWatchlist={removeFromWatchlist}
    />
  </div>

      <section className="news-section">
  <h3>Market News</h3>
  <NewsPanel symbol={symbol} />
</section>




  {/* Footer */}
  <footer className="footer">
    <p>Contact us: support@algorithmtrading.com</p>
    <p>© 2025 Ruibo Sun. All rights reserved.
    </p>
  </footer>
</div>
  );
}
