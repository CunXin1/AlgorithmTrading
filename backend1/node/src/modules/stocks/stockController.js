import { fetchIntraday } from "./yahooService.js";

export async function fetchStockData(req, res) {
  try {
    const { symbol } = req.params;
    const date = req.query.date || null;

    const data = await fetchIntraday(symbol, date);

    res.json({
      symbol,
      interval: "1m",
      count: data.length,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
