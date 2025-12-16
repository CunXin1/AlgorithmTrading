// ------------------------------------------------------------
// Navbar.jsx
// ------------------------------------------------------------

import React, { useEffect, useState } from "react";
import "../../styles/layout.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------
     Check login status
     ------------------------------ */
  useEffect(() => {
    fetch("/api/auth/me/", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* ------------------------------
     Handle My Dashboard click
     ------------------------------ */
  async function handleDashboardClick(e) {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/me/", {
        credentials: "include",
      });

      if (!res.ok) {
        // ❌ 未登录 → Login
        window.location.href = "/login";
        return;
      }

      const me = await res.json();
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/login";
    }
  }

  /* ------------------------------
     Logout
     ------------------------------ */
  async function handleLogout() {
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  }

  return (
    <header className="navbar">
      {/* 左侧 */}
      <div className="navbar-left">
        <img
          src={encodeURI("/assets/logo.png")}
          alt="AlgorithmTrading logo"
          className="nav-logo"
        />
        <h2 className="logo">AlgorithmTrading</h2>
      </div>

      {/* 中间 */}
      <nav className="navbar-center">
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/news">News</a></li>
          <li><a href="/marketsentiment">Market Sentiment</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
          <li>
            <a href="#" onClick={handleDashboardClick}>
              Dashboard
            </a>
          </li>
        </ul>
      </nav>

      {/* 右侧 */}
      <div className="navbar-right">
        {!loading && (
          user ? (
            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <a href="/login" className="login-btn">
              Login
            </a>
          )
        )}
      </div>
    </header>
  );
}
