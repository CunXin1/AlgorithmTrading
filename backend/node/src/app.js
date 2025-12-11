import express from "express";
import authRoutes from "./modules/auth/authRoutes.js";
import stockRoutes from "./modules/stocks/stockRoutes.js";
import cors from "cors";

const app = express();

app.use(express.json());

// Register module routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);

export default app;

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: false
}));