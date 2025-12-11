// ------------------------------------------------------------
// authMiddleware.js
// ------------------------------------------------------------
// Protect routes requiring authentication.
//
// 保护需要身份验证的 API 路由。
// ------------------------------------------------------------

import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ error: "Missing token" });

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
