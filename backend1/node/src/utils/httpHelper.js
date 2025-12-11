// ------------------------------------------------------------
// httpHelper.js
// ------------------------------------------------------------
// This module provides a lightweight, reusable HTTP GET utility
// function for making REST API calls with retry and cache-busting
// mechanisms. It is used by higher-level service modules such as
// yahooService.js to handle all HTTP communication logic.
//
// 本模块提供一个可复用的轻量级 HTTP GET 工具函数，
// 支持自动重试与反缓存机制，用于发起 REST API 请求。
// 它被上层的服务模块（如 yahooService.js）调用，
// 统一管理所有的网络通信逻辑。
// ------------------------------------------------------------

import axios from "axios"; // Import Axios HTTP client (导入 Axios HTTP 客户端)

// ------------------------------------------------------------
// Global Request Headers
// ------------------------------------------------------------
// Define standard headers for all outgoing requests.
// In this case, only a custom User-Agent is included to mimic
// a browser request, which some public APIs (like Yahoo Finance)
// require to respond properly.
//
// 全局请求头定义：
// 定义所有请求通用的 HTTP 头部。
// 这里仅包含一个 User-Agent 伪装，以模拟浏览器请求，
// 因为部分公共 API（如 Yahoo Finance）要求带有该头部才能返回正常响应。
// ------------------------------------------------------------
const HEADERS = { "User-Agent": "Mozilla/5.0" };


// ------------------------------------------------------------
// httpGet()
// ------------------------------------------------------------
// Description (English):
// A universal GET request function with retry logic and
// a "cache-buster" timestamp to avoid cached responses.
// It returns the parsed JSON response once a successful
// result is received or throws an error after multiple failures.
//
// 描述（中文说明）：
// 通用的 GET 请求函数，带有自动重试机制与“反缓存”时间戳参数。
// 若请求成功则返回解析后的 JSON 数据；
// 若多次失败则抛出错误信息。
// ------------------------------------------------------------
/**
 * Universal GET helper with retries and cache-buster
 * 通用 HTTP GET 工具函数，带重试与反缓存机制
 *
 * @param {string} url - Request URL 请求的完整地址
 * @param {object} params - Query parameters (optional) 查询参数（可选）
 * @param {number} retries - Retry attempts 重试次数（默认3次）
 * @param {number} delay - Delay between retries (milliseconds) 每次重试的间隔（毫秒）
 * @returns {Promise<object>} Parsed JSON response 返回解析后的 JSON 响应对象
 */
export async function httpGet(url, params = {}, retries = 3, delay = 600) {
  // Variable to store the last encountered error
  // 保存最近一次出现的错误信息，用于最终抛出
  let lastErr;

  // ------------------------------------------------------------
  // Retry loop
  // ------------------------------------------------------------
  // Attempt the HTTP GET request up to `retries` times.
  // Each failure waits for `delay` ms before retrying.
  //
  // 重试循环：
  // 最多尝试 `retries` 次请求；
  // 每次失败后等待 `delay` 毫秒再重试。
  // ------------------------------------------------------------
  for (let i = 0; i < retries; i++) {
    try {
      // Append a cache-busting timestamp parameter (“_”)
      // to prevent CDN or browser-level caching.
      //
      // 添加“反缓存”时间戳参数（_），避免CDN或浏览器缓存旧数据。
      const fullParams = { ...params, _: Date.now() };

      // Perform the GET request with axios
      // 执行 HTTP GET 请求
      const resp = await axios.get(url, {
        params: fullParams,
        headers: HEADERS,
        timeout: 10000, // timeout after 10 seconds (设置超时为10秒)
      });

      // Extract response data
      // 提取响应体中的数据
      const js = resp.data;

      // Verify response validity for Yahoo Finance API
      // Check if "chart.result" exists and is non-empty.
      //
      // 验证返回数据是否符合Yahoo Finance结构：
      // 存在“chart.result”字段且不为空即视为成功。
      if (js.chart?.result?.length) return js;

    } catch (e) {
      // Record the current error and wait before retrying
      // 记录当前错误并等待指定延迟后重试
      lastErr = e;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // ------------------------------------------------------------
  // Throw error after all retries failed
  // ------------------------------------------------------------
  // Once all attempts fail, throw a descriptive error message
  // that includes the last encountered error.
  //
  // 若所有重试均失败，则抛出包含最后一次错误信息的异常。
  // ------------------------------------------------------------
  throw new Error(`HTTP request failed: ${lastErr}`);
}
