import express from "express";
import authRoutes from "./modules/auth/authRoutes.js";
import stockRoutes from "./modules/stocks/stockRoutes.js";
import backtestRoutes from "./modules/backtest/backtestRoutes.js";
import aiRoutes from "./modules/ai/aiRoutes.js";

const app = express();

app.use(express.json());

// Register module routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/backtest", backtestRoutes);
app.use("/api/ai", aiRoutes);

export default app;
