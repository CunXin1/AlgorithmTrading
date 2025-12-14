// ------------------------------------------------------------
// StockPage.jsx
// ------------------------------------------------------------
// Stock detail page:
// - TradingView chart (left 2/3)
// - Right sidebar (Trending + Watchlist)
// - Search bar
// - News section
// ------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TradingViewChart from "../components/TradingviewChart.jsx";
import RightSidebar from "../components/RightSidebar.jsx";
import "../styles/layout.css";
import NewsPanel from "../components/NewsPanel.jsx";
import { useWatchlist } from "../context/WatchlistContext";

const TRENDING = ["NVDA", "AVGO", "PLTR", "META", "AMD", "TSLA", "AMZN"];

export default function StockPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  const [currentSymbol, setCurrentSymbol] = useState(
    symbol?.toUpperCase() || "AAPL"
  );
  const [input, setInput] = useState("");

  // ✅ 全站唯一 watchlist 来源（Context）
  const { watchlist, add, remove } = useWatchlist();

  /* ------------------------------
     Sync URL → state
     ------------------------------ */
  useEffect(() => {
    if (symbol) {
      setCurrentSymbol(symbol.toUpperCase());
    }
  }, [symbol]);

  /* ------------------------------
     Handlers
     ------------------------------ */
  const handleSearch = (e) => {
    e.preventDefault();
    const formatted = input.trim().toUpperCase();
    if (!formatted) return;

    setCurrentSymbol(formatted);
    navigate(`/stock/${formatted.toLowerCase()}`);
  };

  /* ------------------------------
     Render
     ------------------------------ */
  return (
    <div className="homepage">
      {/* Search */}
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
            onClick={() => add(input || currentSymbol)}
          >
            + Watchlist
          </button>
        </form>
      </section>

      {/* Main layout */}
      <div className="stock-layout">
        {/* Left: TradingView */}
        <div className="stock-left">
          <section className="chart-section">
            <div className="stock-chart-shell">
              <TradingViewChart symbol={currentSymbol} />
            </div>
          </section>
        </div>

        {/* Right: Sidebar（Context 版本，不再传 watchlist props） */}
        <RightSidebar trending={TRENDING} />
      </div>

      {/* News */}
      <section className="news-section">
        <h3>{currentSymbol} News</h3>
        <NewsPanel symbol={currentSymbol} />
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Ruibo Sun. All rights reserved.</p>
      </footer>
    </div>
  );
}
