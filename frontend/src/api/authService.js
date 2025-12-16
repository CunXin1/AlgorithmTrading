// ------------------------------------------------------------
// authService.js
// ------------------------------------------------------------
// Frontend auth API layer
// All authentication-related HTTP requests are centralized here
// Uses session-based auth (Django session cookies)
// ------------------------------------------------------------

import { ENDPOINTS } from "./config";
import { getCSRFToken } from "../utils/csrf";

/* =========================
   Ensure CSRF cookie is set
   ========================= */
export async function ensureCSRF() {
  await fetch(ENDPOINTS.CSRF, { credentials: "include" });
}

/* =========================
   Send email verification code
   ========================= */
export async function sendCode(email) {
  const csrfToken = getCSRFToken();
  const res = await fetch(ENDPOINTS.AUTH_SEND_CODE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRFToken": csrfToken }),
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to send verification code");
  }

  return data;
}

/* =========================
   Register
   ========================= */
export async function register({
  email,
  username,
  firstName,
  lastName,
  password,
  confirmPassword,
  code,
  avatar,
}) {
  const csrfToken = getCSRFToken();
  const res = await fetch(ENDPOINTS.AUTH_REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRFToken": csrfToken }),
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      username,
      first_name: firstName,
      last_name: lastName,
      password,
      confirm_password: confirmPassword,
      code,
      avatar,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Register failed");
  }

  return data;
}

/* =========================
   Login
   ========================= */
export async function login(email, password) {
  const csrfToken = getCSRFToken();
  const res = await fetch(ENDPOINTS.AUTH_LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRFToken": csrfToken }),
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

/* =========================
   Logout
   ========================= */
export async function logout() {
  try {
    const csrfToken = getCSRFToken();
    await fetch(ENDPOINTS.AUTH_LOGOUT, {
      method: "POST",
      headers: {
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
      credentials: "include",
    });
  } catch {
    // Silently handle logout errors
  }
}

/* =========================
   Get current user
   ========================= */
export async function getMe() {
  const res = await fetch(ENDPOINTS.AUTH_ME, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) return null;
  return await res.json();
}
