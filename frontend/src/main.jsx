// ------------------------------------------------------------
// main.jsx
// ------------------------------------------------------------
// Application entry point.
// This file mounts the React app into the DOM root element.
//
// 应用入口文件。
// 该文件负责把 React 应用挂载到 HTML 页面中的 root 节点。
// ------------------------------------------------------------

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { WatchlistProvider } from "./context/WatchlistContext";

// Import global styles
// 导入全局样式（字体、颜色、布局等）
import "./styles/global.css";
import "./styles/layout.css";

// Create React root and render the main <App />
// 创建 React 根节点并渲染主应用组件 <App />
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WatchlistProvider><App /></WatchlistProvider>
  </React.StrictMode>
);
