// src/services/stockService.js

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchStockData(symbol, date = null) {
  if (!API_URL) {
    console.error("❌ Missing VITE_API_URL environment variable.");
    throw new Error("API URL not configured.");
  }

  const query = date ? `?date=${date}` : "";
  const url = `${API_URL}/api/stocks/${symbol}${query}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch stock data for ${symbol}`);
  }

  return await res.json();
}
