// ------------------------------------------------------------
// HomePage.jsx
// ------------------------------------------------------------
// Main landing page of the AlgorithmTrading platform.
// Contains:
// - TradingView embedded chart (QQQ)
// - Search bar to input stock symbols
// - Recommended "To Buy" stock buttons
// - News section (placeholder for now)
// - Footer with contact and copyright
//
// 网站主页面，包括：
// - TradingView 嵌入图表（默认 QQQ）
// - 股票搜索框
// - 推荐股票按钮区
// - 新闻区（占位）
// - 底部信息区
// ------------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import "../styles/layout.css";

export default function HomePage() {
  const containerRef = useRef(null);
  const [symbol, setSymbol] = useState("NASDAQ:QQQ");
  const [input, setInput] = useState("");

  // 按 TradingView 官方规范加载图表脚本
  useEffect(() => {
    // 清空旧内容防止重复加载
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "America/New_York",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      container_id: "tradingview_chart",
    });
    containerRef.current.appendChild(script);
  }, [symbol]);

  // 搜索股票函数
  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const formatted = input.trim().toUpperCase();
    setSymbol(formatted.startsWith("NASDAQ:") ? formatted : `NASDAQ:${formatted}`);
    setInput("");
    window.history.pushState({}, "", `/${formatted.replace("NASDAQ:", "")}`);
  };

  // 推荐股票按钮点击
  const handleSelect = (sym) => {
    setSymbol(`NASDAQ:${sym}`);
    window.history.pushState({}, "", `/${sym}`);
  };

  return (
    <div className="homepage">
      {/* TradingView Chart */}
      <section className="chart-section">
        <div
          className="tradingview-widget-container"
          ref={containerRef}
          id="tradingview_chart"
          style={{ height: "600px", width: "100%", margin: "0 auto" }}
        ></div>
      </section>

      {/* 搜索框 */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search Stock"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
      </section>

      {/* 推荐股票 */}
      <section className="recommend-section">
        <h3>To Buy</h3>
        <div className="stock-buttons">
          {["AAPL", "NVDA", "TSLA", "AMZN", "MSFT"].map((sym) => (
            <button key={sym} className="stock-btn" onClick={() => handleSelect(sym)}>
              {sym}
            </button>
          ))}
        </div>
      </section>

      {/* 新闻区（占位） */}
      <section className="news-section">
        <h3>Market News</h3>
        <p style={{ color: "#666" }}>
          Latest financial headlines will appear here. (To be implemented)
        </p>
      </section>

      {/* 页脚 Footer */}
      <footer className="footer">
        <p>Contact us: support@algorithmtrading.com</p>
        <p>© 2025 Ruibo Sun. All rights reserved.</p>
      </footer>
    </div>
  );
}
