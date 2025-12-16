// src/services/stockService.js

import { ENDPOINTS } from "./config";

export async function fetchStockData(symbol, date = null) {
  const query = date ? `?date=${date}` : "";
  const url = `${ENDPOINTS.STOCKS(symbol)}${query}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch stock data for ${symbol}`);
  }

  return await res.json();
}
