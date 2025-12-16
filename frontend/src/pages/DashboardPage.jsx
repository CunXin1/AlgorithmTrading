// ------------------------------------------------------------
// DashboardPage.jsx
// ------------------------------------------------------------
// User dashboard with profile, watchlist, emails, portfolios
// Protected by ProtectedRoute in App.jsx
// ------------------------------------------------------------

import React from "react";

import "../styles/dashboard.css";
import ProfileCard from "../components/dashboard/ProfileCard.jsx";
import WatchlistCard from "../components/dashboard/WatchlistCard.jsx";
import EmailCard from "../components/dashboard/EmailSubscriptionsCard.jsx";
import PortfoliosCard from "../components/dashboard/PortfoliosCard.jsx";
import useEmailSubscriptions from "../hooks/useEmailSubscriptions.js";

export default function DashboardPage() {
  const {
    subs,
    emailInput,
    setEmailInput,
    handleAddEmail,
    toggleEmail,
    removeEmail,
    MAX_EMAILS,
  } = useEmailSubscriptions();

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* ===== Top Section ===== */}
        <div className="dashboard-top-section">

          {/* Row 1: Profile + Watchlist */}
          <div className="dashboard-top-row">
            <ProfileCard />
            <div className="watchlist">
              <WatchlistCard />
            </div>
          </div>

          {/* Row 2: Email + Portfolio */}
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
