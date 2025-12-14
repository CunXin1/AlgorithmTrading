import React from "react";
import "../styles/layout.css";
import "../styles/dashboard.css";

import ProfileCard from "../components/dashboard/ProfileCard.jsx";
import WatchlistCard from "../components/dashboard/WatchlistCard.jsx";
import EmailSubscriptionsCard from "../components/dashboard/EmailSubscriptionsCard.jsx";
import PortfoliosCard from "../components/dashboard/PortfoliosCard.jsx";
import MarketCardsRow from "../components/dashboard/MarketCardsRow.jsx";
import MyNewsBlock from "../components/dashboard/MyNewsBlock.jsx";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* ===== Top Section ===== */}
        <div className="dashboard-top-grid">
          <ProfileCard />
          <WatchlistCard />
          <EmailSubscriptionsCard />
          <PortfoliosCard />
        </div>

        {/* ===== Market Row ===== */}
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Market Snapshot</h2>
          <MarketCardsRow />
        </div>

        {/* ===== My News ===== */}
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">My News</h2>
          <MyNewsBlock />
        </div>
      </div>
    </div>
  );
}
