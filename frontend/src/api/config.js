// ------------------------------------------------------------
// config.js
// ------------------------------------------------------------
// Centralized configuration for frontend API calls
// All API requests should use API_BASE from this file
// ------------------------------------------------------------

/**
 * Backend API Base URL
 * - Loaded from environment variable VITE_API_URL
 * - Falls back to empty string for relative URLs (same-origin deployment)
 * - No trailing slash
 */
export const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * API Endpoints
 * Use these constants for consistent endpoint references
 */
export const ENDPOINTS = {
  // CSRF
  CSRF: `${API_BASE}/webauthn/csrf/`,

  // Auth (webauthn)
  AUTH_LOGIN: `${API_BASE}/webauthn/login/`,
  AUTH_LOGOUT: `${API_BASE}/webauthn/logout/`,
  AUTH_REGISTER: `${API_BASE}/webauthn/register/`,
  AUTH_SEND_CODE: `${API_BASE}/webauthn/send-code/`,
  AUTH_ME: `${API_BASE}/webauthn/current-user/`,

  // Current User (webauthn)
  PROFILE: `${API_BASE}/webauthn/current-user/profile/`,
  EMAIL_SUBSCRIPTION: `${API_BASE}/webauthn/current-user/sentiment-emails/`,
  WATCHLIST: `${API_BASE}/stock/watchlist/`,

  // Stocks & Finance
  STOCKS: (symbol) => `${API_BASE}/api/stocks/${symbol}/`,
  CURRENT_PRICE: (symbol) => `${API_BASE}/api/currentprice/${symbol}/`,

  // News
  GOOGLE_NEWS: (symbol) =>
    `${API_BASE}/api/news/google/?symbol=${encodeURIComponent(symbol)}`,

  // Market Sentiment
  SENTIMENT_HISTORY: (index, days) =>
    `${API_BASE}/api/sentiment/index/${index}/history/?days=${days}`,
};
