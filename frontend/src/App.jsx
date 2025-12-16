// ------------------------------------------------------------
// App.jsx
// ------------------------------------------------------------
// Main router structure for the entire frontend.
// Defines Navbar + page-level routing.
// ------------------------------------------------------------

import React from "react";
import Navbar from "./components/common/Navbar.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
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
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <div className="app-container">
            {/* Navbar */}
            <Navbar />

            {/* Main content routes */}
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/stock/:symbol" element={<StockPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:symbol" element={<NewsStockPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/marketsentiment" element={<MarketSentimentPage />} />

                {/* Protected routes - require authentication */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/myportfolio"
                  element={
                    <ProtectedRoute>
                      <MyPortfolioPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
