// ------------------------------------------------------------
// RightSidebar.jsx
// ------------------------------------------------------------
// Reusable right sidebar with:
// - Trending stocks (click to /stock/:symbol)
// - My Watchlist (empty state + add/remove + click)
// ------------------------------------------------------------

import React from "react";
import { useNavigate } from "react-router-dom";

export default function RightSidebar({
  trending = [],
  watchlist = [],
  onAddToWatchlist,
  onRemoveFromWatchlist,
}) {
  const navigate = useNavigate();

  return (
    <aside className="right-sidebar">
      {/* Trending */}
      <div className="sidebar-card">
        <div className="sidebar-header">
          <h4 className="sidebar-title">🔥 Trending Stocks</h4>
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
                onClick={() => onAddToWatchlist?.(sym)}
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
          <h4 className="sidebar-title">⭐ My Watchlist</h4>
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
                  onClick={() => onRemoveFromWatchlist?.(sym)}
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
