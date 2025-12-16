// ------------------------------------------------------------
// App.jsx
// ------------------------------------------------------------
// Main router structure for the entire frontend.
// Defines Navbar + page-level routing.
//
// 完整前端路由结构：顶栏 + 页面路由
// ------------------------------------------------------------

import React from "react";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import PortfolioPage from "./pages/PortfolioPage";
import MyPortfolioPage from "./pages/MyPortfolioPage";
import StockPage from "./pages/StockPage";
import DashboardPage from "./pages/DashboardPage";
import MarketSentimentPage from "./pages/MarketSentimentPage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import NewsStockPage from "./pages/NewsStockPage.jsx";


import { BrowserRouter, Routes, Route } from "react-router-dom";

// 如果你未来加入 AuthContext，需要在顶层包裹：
// import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      {/* 如果你使用登录状态管理： */}
      {/* <AuthProvider> */}

      <div className="app-container">
        {/* 顶栏导航 */}
        <Navbar />

        {/* 主体内容路由 */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/stock/:symbol" element={<StockPage />} />
            <Route path="/dashboard/:username" element={<DashboardPage />} />

            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:symbol" element={<NewsStockPage />} />



            {/* 名人投资组合页 */}
            <Route path="/portfolio" element={<PortfolioPage />} />

            {/* 用户自建投资组合页 */}
            <Route path="/myportfolio" element={<MyPortfolioPage />} />


            {/* 市场情绪页 */}
            <Route path="/marketsentiment" element={<MarketSentimentPage />} />

          </Routes>
        </main>
      </div>

      {/* </AuthProvider> */}
    </BrowserRouter>
  );
}
