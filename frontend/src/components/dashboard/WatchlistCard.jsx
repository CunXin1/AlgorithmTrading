import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../context/WatchlistContext";


export default function WatchlistCard() {
  const navigate = useNavigate();
  const { watchlist, add, remove } = useWatchlist();
  const [input, setInput] = useState("");

  function normalizeSymbol(s) {
    return String(s || "").trim().toUpperCase();
  }

  function handleAdd() {
    const sym = normalizeSymbol(input);
    if (!sym) return;
    add(sym);
    setInput("");
  }

  return (
    <div className="dash-card">
      {/* Header */}
      <div className="dash-card-header">
        <h3 className="dash-card-title">My Watchlist</h3>
      </div>

      {/* Add input */}
      <div className="watchlist-add">
        <input
          className="dash-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add symbol (e.g. AAPL)"
        />
        <button
          className="dash-btn primary"
          type="button"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>

      {/* List */}
      {watchlist.length === 0 ? (
        <div className="dash-empty">
          Empty. Add a symbol to start tracking.
        </div>
      ) : (
        <ul className="dash-list">
          {watchlist.map((sym) => (
            <li key={sym} className="dash-row">
              <button
                className="dash-link"
                type="button"
                onClick={() => navigate(`/stock/${sym.toLowerCase()}`)}
                title={`Open ${sym}`}
              >
                {sym}
              </button>
              <button
                className="dash-x"
                type="button"
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
  );
}
