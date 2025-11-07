// ------------------------------------------------------------
// yahooService.js
// ------------------------------------------------------------
// This module handles data retrieval from the Yahoo Finance API.
// It provides a function to fetch 1-minute (1m) intraday stock data
// during the Regular Trading Hours (RTH: 09:30–16:00 America/New_York).
//
// 本模块用于从 Yahoo Finance 接口拉取数据。
// 提供函数以获取美股在常规交易时段（RTH：纽约时间 09:30–16:00）的
// 1分钟级别（1m）盘中行情数据。
// ------------------------------------------------------------

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { httpGet } from "../utils/httpHelper.js"; // Import the HTTP utility (引入HTTP辅助工具)

// Extend dayjs with timezone and UTC plugins
// 扩展 dayjs，使其支持时区与UTC时间操作
dayjs.extend(utc);
dayjs.extend(timezone);

// ------------------------------------------------------------
// Constants (常量定义)
// ------------------------------------------------------------

// Yahoo Finance base API endpoint
// Yahoo Finance API 基础地址
const BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

// New York timezone name used by dayjs
// dayjs 所用的纽约时区名称
const NY_TZ = "America/New_York";

// Data interval (1 minute granularity)
// 数据时间间隔（1分钟级）
const INTERVAL = "1m";

// Default time range when no specific date is provided
// 默认数据范围（未指定日期时）
const RANGE = "1d";


// ------------------------------------------------------------
// fetchIntraday()
// ------------------------------------------------------------
// Description (English):
// Fetches minute-level (1m) intraday data for a given stock symbol.
// If a specific date (YYYY-MM-DD) is provided, it retrieves data from
// 09:30 to 16:00 New York time for that date. Otherwise, it fetches
// the most recent available trading day.
//
// 描述（中文说明）：
// 获取指定股票代码的 1 分钟盘中数据。
// 若传入日期 (YYYY-MM-DD)，则拉取该日期纽约时间09:30–16:00的数据；
// 若未指定日期，则默认返回最近一个交易日的盘中数据。
// ------------------------------------------------------------
/**
 * Fetch 1m intraday data (RTH only)
 * 获取1分钟级别盘中数据（仅常规交易时段RTH）
 * @param {string} symbol - Stock ticker symbol 股票代码，例如 "AAPL"
 * @param {string|null} date - Date in "YYYY-MM-DD" format (optional) 日期，可选
 * @returns {Promise<Array>} Returns a filtered and formatted array of price data
 *                          返回格式化后的行情数据数组
 */
export async function fetchIntraday(symbol, date = null) {
  // Construct full API URL
  // 构造完整的API请求地址
  const url = `${BASE}${symbol}`;
  const params = { interval: INTERVAL }; // Base query parameters 基础参数

  // ------------------------------------------------------------
  // Define request time range based on provided date
  // 根据是否传入日期决定查询范围
  // ------------------------------------------------------------
  if (date) {
    // Convert the given date to New York local time, and set start & end timestamps
    // 将传入日期转换为纽约当地时间，定义开盘与收盘时间段
    const openLocal = dayjs.tz(`${date} 09:30`, NY_TZ);
    const closeLocal = dayjs.tz(`${date} 16:00`, NY_TZ).add(2, "minute"); // add 2 min buffer 添加2分钟缓冲

    // Convert to UNIX timestamps (in seconds)
    // 转换为UNIX秒级时间戳
    params.period1 = Math.floor(openLocal.unix());
    params.period2 = Math.floor(closeLocal.unix());
  } else {
    // If no date provided, fallback to a 1-day range (most recent trading session)
    // 若未指定日期，则使用默认范围（最近1个交易日）
    params.range = RANGE;
  }

  // ------------------------------------------------------------
  // Perform HTTP GET request with retries (using httpHelper.js)
  // 执行带重试机制的HTTP GET请求（使用httpHelper.js）
  // ------------------------------------------------------------
  const js = await httpGet(url, params);

  // Extract key fields from Yahoo Finance API response
  // 从返回的JSON结构中提取主要数据字段
  const res = js.chart.result[0];
  const timestamps = res.timestamp || [];              // UNIX timestamps (秒级时间戳)
  const quote = res.indicators?.quote?.[0] || {};      // OHLCV 数据对象

  // ------------------------------------------------------------
  // Map timestamped quote data to formatted structure
  // 将时间戳与行情数据映射为标准化结构
  // ------------------------------------------------------------
  const data = timestamps.map((ts, i) => {
    // Convert UNIX timestamp to localized New York time
    // 将UNIX时间戳转换为纽约本地时间
    const t = dayjs.unix(ts).tz(NY_TZ);

    // Extract hour and minute for RTH filtering
    // 提取小时与分钟，用于筛选常规交易时段
    const hour = t.hour();
    const minute = t.minute();

    // ------------------------------------------------------------
    // Filter: Keep only RTH data (09:30–16:00)
    // 仅保留常规交易时段（RTH：09:30–16:00）的数据
    // ------------------------------------------------------------
    const isRTH =
      (hour > 9 || (hour === 9 && minute >= 30)) &&
      (hour < 16 || (hour === 16 && minute === 0));
    if (!isRTH) return null; // Skip pre/post market data 跳过盘前盘后数据

    // Format timestamp to readable ISO-like format without timezone offset
    // 将时间格式化为可读的本地时间字符串（不含时区偏移）
    const formattedTime = t.format("YYYY-MM-DDTHH:mm");

    // Format numeric values to 2 decimal places
    // 将价格类数值保留两位小数
    const formatNum = (x) => (x != null ? Number(x.toFixed(2)) : null);

    // Return normalized record
    // 返回标准化数据记录
    return {
      time: formattedTime,                     // Formatted timestamp 格式化时间
      open: formatNum(quote.open?.[i]),        // Opening price 开盘价
      high: formatNum(quote.high?.[i]),        // Highest price 最高价
      low: formatNum(quote.low?.[i]),          // Lowest price 最低价
      close: formatNum(quote.close?.[i]),      // Closing price 收盘价
      volume: Number(quote.volume?.[i] ?? 0),  // Volume 成交量
    };
  });

  // Filter out nulls (non-RTH) and return cleaned dataset
  // 过滤掉非RTH数据（null值）并返回清洗后的数据集
  return data.filter(Boolean);
}
