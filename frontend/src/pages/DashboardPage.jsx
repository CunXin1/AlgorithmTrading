import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/layout.css";
import "../styles/dashboard.css";

import ProfileCard from "../components/dashboard/ProfileCard.jsx";
import WatchlistCard from "../components/dashboard/WatchlistCard.jsx";
import EmailSubscriptionsCard from "../components/dashboard/EmailSubscriptionsCard.jsx";
import PortfoliosCard from "../components/dashboard/PortfoliosCard.jsx";
import MarketCardsRow from "../components/dashboard/MarketCardsRow.jsx";
import MyNewsBlock from "../components/dashboard/MyNewsBlock.jsx";

export default function DashboardPage() {
  const { username } = useParams(); // 👈 URL 里的 username
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me/", {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }

        const me = await res.json();

        // ❗ 防止访问别人的 dashboard
        if (me.username !== username) {
          window.location.href = `/dashboard/${me.username}`;
        }
      })
      .finally(() => {
        setChecking(false);
      });
  }, [username]);

  if (checking) return null;

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
