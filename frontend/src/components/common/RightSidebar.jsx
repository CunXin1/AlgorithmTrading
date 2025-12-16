// ------------------------------------------------------------
// RightSidebar.jsx
// ------------------------------------------------------------
// Reusable right sidebar with:
// - Trending stocks (click to /stock/:symbol)
// - My Watchlist (context-based, backend-synced)
// ------------------------------------------------------------

import React from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../context/WatchlistContext";

export default function RightSidebar({
  trending = [],
}) {
  const navigate = useNavigate();

  // ✅ 使用全局 Watchlist Context（与你 news 页面一致）
  const { watchlist, add, remove } = useWatchlist();

  return (
    <aside className="right-sidebar">
      {/* Trending */}
      <div className="sidebar-card">
        <div className="sidebar-header">
          <h4 className="sidebar-title">Trending Stocks</h4>
        </div>

        <ul className="sidebar-list">
          {trending.map((sym) => (
            <li key={sym} className="sidebar-row">
              <button
                type="button"
                className="sidebar-link"
                onClick={() => navigate(`/stock/${sym.toLowerCase()}`)}
                title={`Open ${sym}`}
              >
                {sym}
              </button>

              <button
                type="button"
                className="sidebar-action"
                onClick={() => add(sym)}   
               
                title="Add to watchlist"
              >
                +
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Watchlist */}
      <div className="sidebar-card">
        <div className="sidebar-header">
          <h4 className="sidebar-title">My Watchlist</h4>
        </div>

        {watchlist.length === 0 ? (
          <div className="sidebar-empty">
            <div className="sidebar-empty-title">Empty</div>
            <div className="sidebar-empty-subtitle">
              Add stocks from Trending or search.
            </div>
          </div>
        ) : (
          <ul className="sidebar-list">
            {watchlist.map((sym) => (
              <li key={sym} className="sidebar-row">
                <button
                  type="button"
                  className="sidebar-link"
                  onClick={() => navigate(`/stock/${sym.toLowerCase()}`)}
                  title={`Open ${sym}`}
                >
                  {sym}
                </button>

                <button
                  type="button"
                  className="sidebar-action remove"
                  onClick={() => remove(sym)}  
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
