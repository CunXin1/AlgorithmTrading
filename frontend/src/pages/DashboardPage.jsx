// ------------------------------------------------------------
// DashboardPage.jsx
// ------------------------------------------------------------
// User dashboard for AlgorithmTrading
// Includes:
// - User profile
// - Watchlist
// - Portfolios
// - Account snapshot
// - Quick actions
// ------------------------------------------------------------

import React from "react";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  // Mock data（后续接 API）
  const user = {
    name: "Ruibo Sun",
    email: "sunruibo@example.com",
    avatar: "/assets/default-avatar.png",
    plan: "Pro",
  };

  const watchlist = [
    { symbol: "AAPL", price: 189.42, change: +1.24 },
    { symbol: "NVDA", price: 502.31, change: -0.87 },
    { symbol: "MSFT", price: 378.15, change: +0.55 },
  ];

  const portfolios = [
    { name: "Long-term Growth", value: 102340, pnl: +1240 },
    { name: "Options Play", value: 28340, pnl: -320 },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-grid">
        {/* User Profile */}
        <div className="card profile-card">
          <img src={user.avatar} alt="avatar" className="avatar" />
          <h3>{user.name}</h3>
          <p className="email">{user.email}</p>
          <span className="plan-badge">{user.plan}</span>
        </div>

        {/* Account Snapshot */}
        <div className="card snapshot-card">
          <h3>Account Snapshot</h3>
          <div className="snapshot-row">
            <span>Total Equity</span>
            <strong>$130,680</strong>
          </div>
          <div className="snapshot-row">
            <span>Cash</span>
            <strong>$27,000</strong>
          </div>
          <div className="snapshot-row">
            <span>Market Exposure</span>
            <strong>79%</strong>
          </div>
        </div>

        {/* Watchlist */}
        <div className="card watchlist-card">
          <h3>Watchlist</h3>
          {watchlist.map((stock) => (
            <div
              key={stock.symbol}
              className="watchlist-row"
              onClick={() => navigate(`/stock/${stock.symbol}`)}
            >
              <span className="symbol">{stock.symbol}</span>
              <span>${stock.price}</span>
              <span
                className={
                  stock.change >= 0 ? "change positive" : "change negative"
                }
              >
                {stock.change > 0 ? "+" : ""}
                {stock.change}%
              </span>
            </div>
          ))}
        </div>

        {/* Portfolios */}
        <div className="card portfolio-card">
          <h3>My Portfolios</h3>
          {portfolios.map((p) => (
            <div key={p.name} className="portfolio-row">
              <span className="portfolio-name">{p.name}</span>
              <span>${p.value.toLocaleString()}</span>
              <span
                className={p.pnl >= 0 ? "positive" : "negative"}
              >
                {p.pnl >= 0 ? "+" : ""}
                ${p.pnl}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card actions-card">
          <h3>Quick Actions</h3>
          <button onClick={() => navigate("/screener")}>
            Stock Screener
          </button>
          <button onClick={() => navigate("/algorithm")}>
            Algorithm Lab
          </button>
          <button onClick={() => navigate("/portfolio/create")}>
            Create Portfolio
          </button>
        </div>

        {/* Future Section */}
        <div className="card future-card">
          <h3>Alpha Signals (Preview)</h3>
          <p className="muted">
            Strategy signals and backtest results will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
