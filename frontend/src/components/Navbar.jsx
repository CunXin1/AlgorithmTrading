// ------------------------------------------------------------
// Navbar.jsx
// ------------------------------------------------------------
// Top navigation bar for the website.
// Includes main navigation items (Home, News, Invest, Algorithm, Login)
// and a language toggle.
//
// 网站的顶栏导航组件。
// 包含主导航项目（首页、新闻、投资、算法、登录）以及语言切换按钮。
// ------------------------------------------------------------

import React, { useState } from "react";
import "../styles/layout.css";

export default function Navbar() {
  const [language, setLanguage] = useState("EN");

  // 切换中英文
  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "中文" : "EN");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* 网站 Logo 或标题：在标题左侧显示 assets 中的图片 */}
        <img
          src={encodeURI('/assets/logo.png')}
          alt="AlgorithmTrading logo"
          className="nav-logo"
        />
        <h2 className="logo">AlgorithmTrading</h2>
      </div>

      <nav className="navbar-center">
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/news">News</a></li>
          <li><a href="/invest">Invest</a></li>
          <li><a href="/algorithm">Algorithm</a></li>
          <li><a href="/login">Login</a></li>
        </ul>
      </nav>

      <div className="navbar-right">
        {/* 语言切换按钮 */}
        <button onClick={toggleLanguage} className="lang-btn">
          {language}
        </button>
      </div>
    </header>
  );
}
