// ------------------------------------------------------------
// stockRoutes.js
// ------------------------------------------------------------
// This file defines RESTful API routes for stock data retrieval.
// It serves as the interface between the client and the backend service
// that fetches 1-minute intraday stock data from Yahoo Finance.
//
// 本文件定义了用于获取股票数据的 RESTful API 路由。
// 它是前端与后端服务之间的接口，用于从 Yahoo Finance 拉取 1 分钟级别的美股盘中数据。
// ------------------------------------------------------------

import express from "express";
import { fetchIntraday } from "../services/yahooService.js"; // Import the Yahoo data service (引入Yahoo数据服务模块)

const router = express.Router(); // Create a new Express router (创建一个新的Express路由实例)

// ------------------------------------------------------------
// Route: GET /api/stocks/:symbol
// Example: /api/stocks/AAPL?date=2025-10-30
// ------------------------------------------------------------
// Description (English):
// This route retrieves 1-minute intraday stock data for a given ticker symbol.
// By default, it returns data for the previous trading day within regular
// trading hours (RTH: 09:30–16:00 New York time).
//
// Parameters:
//   - :symbol  (string) → The stock ticker (e.g., AAPL, TSLA)
//   - ?date=YYYY-MM-DD (optional) → Specific trading date. If omitted, fetches previous day.
//
// 描述（中文说明）：
// 该路由用于获取指定股票代码的 1 分钟级别盘中数据。
// 默认返回前一个交易日的常规交易时段数据（RTH: 纽约时间09:30–16:00）。
//
// 参数说明：
//   - :symbol  (字符串) → 股票代码，例如 AAPL、TSLA
//   - ?date=YYYY-MM-DD（可选）→ 指定日期；若未指定，则默认返回前一交易日。
// ------------------------------------------------------------

router.get("/:symbol", async (req, res) => {
  try {
    // Extract stock symbol and optional date from request
    // 从请求参数中提取股票代码和日期
    const symbol = req.params.symbol.toUpperCase();
    const date = req.query.date || null; // e.g., "2025-10-30"

    // Call backend service to fetch Yahoo Finance 1m intraday data
    // 调用后端服务函数，从Yahoo Finance拉取1分钟盘中数据
    const df = await fetchIntraday(symbol, date);

    // Return structured JSON response
    // 返回标准化的JSON响应数据
    res.json({
      symbol,                           // Stock ticker symbol (股票代码)
      timezone: "America/New_York",     // Data timezone (数据所属时区)
      interval: "1m",                   // Interval between data points (时间间隔：1分钟)
      session: "RTH (09:30–16:00)",     // Trading session information (交易时段)
      count: df.length,                 // Number of data points returned (返回的数据点数量)
      data: df,                         // The actual price/volume time series (具体的价格与成交量数据)
    });

  } catch (err) {
    // Error handling: log and send 500 response
    // 错误处理：记录错误并返回500状态码
    console.error("Yahoo API Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------------------------------------------------
// Helper: fetchStockData()
// ------------------------------------------------------------
// This is a frontend-compatible helper function that can also be used
// within the same backend for testing or server-side rendering.
//
// Functionality:
// It sends a GET request to the backend API /api/stocks/:symbol and
// returns the parsed JSON response.
//
// 辅助函数：fetchStockData()
// ------------------------------------------------------------
// 此函数可供前端或服务端共用，向本后端发起HTTP请求，
// 获取指定股票的JSON行情数据。
//
// 功能说明：
// 向 `/api/stocks/:symbol` 发出GET请求，并返回解析后的JSON结果。
// ------------------------------------------------------------

export async function fetchStockData(symbol, date = null) {
  // Build query string for optional date parameter
  // 构造查询字符串（可选的日期参数）
  const query = date ? `?date=${date}` : "";

  // Send HTTP request to backend API
  // 发送HTTP请求到后端API
  const res = await fetch(`/api/stocks/${symbol}${query}`);

  // Check for network or HTTP errors
  // 检查网络或HTTP错误
  if (!res.ok) throw new Error("Failed to fetch stock data");

  // Parse and return JSON body
  // 解析并返回JSON数据体
  return await res.json();
}


// Export router for Express app
// 导出路由对象供Express主应用使用
export default router;
