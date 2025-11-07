// ------------------------------------------------------------
// App.jsx
// ------------------------------------------------------------
// Main application component.
// Defines the global layout: Navbar (top) + Main content (HomePage).
//
// 应用主组件。
// 定义全局布局结构：顶栏 (Navbar) + 主体内容 (HomePage)。
// ------------------------------------------------------------

import React from "react";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";

// App component
// 这是整个网站的根组件
export default function App() {
  return (
    <div className="app-container">
      {/* 顶栏导航 */}
      <Navbar />

      {/* 主体内容区域 */}
      <main className="main-content">
        <HomePage />
      </main>
    </div>
  );
}
