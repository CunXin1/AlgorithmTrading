// ------------------------------------------------------------
// Navbar.jsx
// ------------------------------------------------------------
// Top navigation bar with authentication state from AuthContext
// ------------------------------------------------------------

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";

export default function Navbar() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /* ------------------------------
     Handle Dashboard click
     ------------------------------ */
  function handleDashboardClick(e) {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  /* ------------------------------
     Handle Logout
     ------------------------------ */
  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      {/* Left */}
      <div className="navbar-left">
        <img
          src={encodeURI("/assets/logo.png")}
          alt="AlgorithmTrading logo"
          className="nav-logo"
        />
        <h2 className="logo">AlgorithmTrading</h2>
      </div>

      {/* Center */}
      <nav className="navbar-center">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/news">News</Link></li>
          <li><Link to="/marketsentiment">Market Sentiment</Link></li>
          <li><Link to="/portfolio">Portfolio</Link></li>
          <li>
            <a href="#" onClick={handleDashboardClick}>
              Dashboard
            </a>
          </li>
        </ul>
      </nav>

      {/* Right */}
      <div className="navbar-right">
        {!loading && (
          isAuthenticated ? (
            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )
        )}
      </div>
    </header>
  );
}
