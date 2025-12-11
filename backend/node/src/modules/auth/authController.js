// ------------------------------------------------------------
// authController.js
// ------------------------------------------------------------
// Handles login & registration requests from frontend.
// Uses authService.js (which talks to Django API).
//
// 处理前端的登录与注册请求，交给 authService 与 Django 通信。
// ------------------------------------------------------------

import { loginRequest, registerRequest } from "../../services/authService.js";
import { createToken } from "../../utils/jwtHelper.js";

// ------------------------------------------------------------
// POST: /auth/login
// ------------------------------------------------------------
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing email or password" });

    // Ask Django to verify user credentials
    const djangoUser = await loginRequest(email, password);

    // Generate JWT token for frontend
    const token = createToken({ email: djangoUser.email });

    res.json({
      success: true,
      token,
      user: {
        email: djangoUser.email,
      },
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

// ------------------------------------------------------------
// POST: /auth/register
// ------------------------------------------------------------
export async function registerUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing email or password" });

    // ask Django to create user
    const newUser = await registerRequest(email, password);

    const token = createToken({ email: newUser.email });

    res.json({
      success: true,
      token,
      user: {
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
