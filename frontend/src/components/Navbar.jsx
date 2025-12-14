// ------------------------------------------------------------
// Navbar.jsx
// ------------------------------------------------------------
// Top navigation bar for the website.
// Includes main navigation items (Home, News, Invest, Algorithm, Portfolio)
// and a Login button on the right.
//
// 网站的顶栏导航组件。
// 主导航：Home / News / Invest / Algorithm / Portfolio
// 右上角：Login
// ------------------------------------------------------------

import React from "react";
import "../styles/layout.css";

export default function Navbar() {
  return (
    <header className="navbar">
      {/* 左侧：Logo + 标题 */}
      <div className="navbar-left">
        <img
          src={encodeURI("/assets/logo.png")}
          alt="AlgorithmTrading logo"
          className="nav-logo"
        />
        <h2 className="logo">AlgorithmTrading</h2>
      </div>

      {/* 中间：主导航 */}
      <nav className="navbar-center">
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/news">News</a></li>
          <li><a href="/marketsentiment">Market Sentiment</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
        </ul>
      </nav>

      {/* 右侧：Login */}
      <div className="navbar-right">
        <a href="/login" className="login-btn">Login</a>
      </div>
    </header>
  );
}
