import { ENDPOINTS } from "../api/config";

/**
 * Fetch news for a stock symbol from backend.
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @returns {Promise<Array>} - Array of news items
 */
export async function fetchStockNews(symbol) {
  const res = await fetch(ENDPOINTS.STOCK_NEWS(symbol), { cache: "no-store" });

  if (!res.ok) {
    console.error(`Failed to fetch news for ${symbol}`);
    return [];
  }

  const data = await res.json();
  return data.news || [];
}

/**
 * Fetch general news for a search query from backend.
 * @param {string} query - Search query (e.g., 'Federal Reserve Jerome Powell')
 * @returns {Promise<Array>} - Array of news items
 */
export async function fetchGeneralNews(query) {
  const res = await fetch(ENDPOINTS.GENERAL_NEWS(query), { cache: "no-store" });

  if (!res.ok) {
    console.error(`Failed to fetch news for query: ${query}`);
    return [];
  }

  const data = await res.json();
  return data.news || [];
}

/**
 * Legacy function for backwards compatibility.
 * Routes to appropriate endpoint based on query type.
 * @param {string} query - Stock symbol or search query
 * @returns {Promise<Array>} - Array of news items
 */
export async function fetchGoogleNews(query) {
  // If it looks like a stock symbol (short uppercase), use stock endpoint
  const isStockSymbol = /^[A-Z]{1,5}$/.test(query.trim());
  
  if (isStockSymbol) {
    return fetchStockNews(query);
  }
  
  return fetchGeneralNews(query);
}
