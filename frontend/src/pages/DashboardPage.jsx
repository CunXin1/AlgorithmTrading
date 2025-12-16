import React, { useEffect, useState } from "react";

import "../styles/dashboard.css";
import ProfileCard from "../components/dashboard/ProfileCard.jsx";
import WatchlistCard from "../components/dashboard/WatchlistCard.jsx";
import EmailCard from "../components/dashboard/EmailSubscriptionsCard.jsx";
import PortfoliosCard from "../components/dashboard/PortfoliosCard.jsx";
import useEmailSubscriptions from "../hooks/useEmailSubscriptions.js";
import { ENDPOINTS } from "../api/config";

export default function DashboardPage() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS.AUTH_ME, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const {
    subs,
    emailInput,
    setEmailInput,
    handleAddEmail,
    toggleEmail,
    removeEmail,
    MAX_EMAILS,
  } = useEmailSubscriptions();
  if (checking) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* ===== Top Section ===== */}
        <div className="dashboard-top-section">

          {/* 第一行：Profile + Watchlist */}
          <div className="dashboard-top-row">
            <ProfileCard />
            <div className="watchlist">
              <WatchlistCard />
            </div>
          </div>

          {/* 第二行：Email + Portfolio */}
          <div className="dashboard-second-row">
            <EmailCard
              subs={subs}
              input={emailInput}
              setInput={setEmailInput}
              handleAdd={handleAddEmail}
              toggle={toggleEmail}
              remove={removeEmail}
              MAX_EMAILS={MAX_EMAILS}
            />

            <PortfoliosCard />
          </div>
        </div>

      </div>

    </div>
  );
}
