// ------------------------------------------------------------
// authController.js
// ------------------------------------------------------------
// Handles login & registration requests from frontend.
// ------------------------------------------------------------

import { loginUser, registerUser } from "./authService.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.json(result);
  } catch (err) {
    console.error("Login error:", err);
    res.status(401).json({ error: err.message });
  }
}

export async function register(req, res) {
  try {
    const { email, password } = req.body;

    const result = await registerUser(email, password);

    res.json(result);
  } catch (err) {
    console.error("Register error:", err);
    res.status(400).json({ error: err.message });
  }
}
