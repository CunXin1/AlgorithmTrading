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


const TRENDING = ["NVDA", "AVGO", "PLTR", "META", "AMD", "TSLA", "AMZN"];
const LS_KEY = "algorithmtrading_watchlist_v1";

export default function StockPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  const [currentSymbol, setCurrentSymbol] = useState(symbol?.toUpperCase() || "AAPL");
  const [input, setInput] = useState("");
  const [watchlist, setWatchlist] = useState([]);

  /* ------------------------------
     Watchlist (localStorage)
     ------------------------------ */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setWatchlist(parsed.map((s) => s.toUpperCase()));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

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

    setInput("");
    navigate(`/stock/${formatted.toLowerCase()}`);
  };

  const addToWatchlist = (sym) => {
    const s = sym.toUpperCase();
    setWatchlist((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const removeFromWatchlist = (sym) => {
    const s = sym.toUpperCase();
    setWatchlist((prev) => prev.filter((x) => x !== s));
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
            onClick={() => addToWatchlist(currentSymbol)}
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

        {/* Right: Sidebar */}
        <RightSidebar
          trending={TRENDING}
          watchlist={watchlist}
          onAddToWatchlist={addToWatchlist}
          onRemoveFromWatchlist={removeFromWatchlist}
        />
      </div>
 
  <section className="news-section">
    <h3>{currentSymbol} News</h3>
    <NewsPanel symbol={symbol} />
  </section>
  

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Ruibo Sun. All rights reserved.</p>
      </footer>
    </div>
  );
}
