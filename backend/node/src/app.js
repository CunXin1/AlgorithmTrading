import express from "express";
import authRoutes from "./modules/auth/authRoutes.js";
import stockRoutes from "./modules/stocks/stockRoutes.js";
import cors from "cors";

const app = express();

// ✅ CORS 必须放最前面！
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: false
}));

// body parser
app.use(express.json());

// 注册路由
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);

export default app;
