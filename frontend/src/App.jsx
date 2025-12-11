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
          </Routes>
        </main>
      </div>

      {/* </AuthProvider> */}
    </BrowserRouter>
  );
}
