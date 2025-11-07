import { getMinuteData } from "../services/yahooService.js";

export async function fetchStockData(req, res) {
  try {
    const { symbol } = req.params;
    const data = await getMinuteData(symbol);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
