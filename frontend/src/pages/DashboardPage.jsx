import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "../styles/dashboard.css";
import ProfileCard from "../components/dashboard/ProfileCard.jsx";
import WatchlistCard from "../components/dashboard/WatchlistCard.jsx";
import EmailSubscriptionsCard from "../components/dashboard/EmailSubscriptionsCard.jsx";
import PortfoliosCard from "../components/dashboard/PortfoliosCard.jsx";
import MarketCardsRow from "../components/dashboard/MarketCardsRow.jsx";
import MyNewsBlock from "../components/dashboard/MyNewsBlock.jsx";

export default function DashboardPage() {
  const { username } = useParams();
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

        // 防止访问别人的 dashboard
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
        <div className="dashboard-top-section">

          {/* 第一行：Profile + Watchlist */}
          <div className="dashboard-top-row">
            <ProfileCard />
            <div className ="watchlist">
            <WatchlistCard />
            </div>
          </div>

          {/* 第二行：Email + Portfolio */}
          <div className="dashboard-second-row">
            <EmailSubscriptionsCard />
            <PortfoliosCard />
          </div>

          {/* 第三行 Market Snapshot */}
          <div className="dashboard-third-row">
            <h2 className="dashboard-section-title">Market Snapshot</h2>
            <MarketCardsRow />
          </div>
          {/* 第四行 My News */}
          <div className="dashboard-fourth-row">
            <h2 className="dashboard-section-title">My News</h2>
            <MyNewsBlock />
          </div>
        </div>

      </div>
    
    </div>
  );
}
