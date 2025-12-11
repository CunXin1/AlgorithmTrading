// ------------------------------------------------------------
// jwtHelper.js
// ------------------------------------------------------------

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "YOUR_SUPER_SECRET_KEY";

// create token
export function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// verify token
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
