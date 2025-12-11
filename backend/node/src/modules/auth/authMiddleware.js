// ------------------------------------------------------------
// authMiddleware.js
// ------------------------------------------------------------
// Protect routes requiring authentication.
//
// 保护需要身份验证的 API 路由。
// ------------------------------------------------------------

import { verifyToken } from "../../utils/jwtHelper.js";

export function authRequired(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Missing authentication token" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
