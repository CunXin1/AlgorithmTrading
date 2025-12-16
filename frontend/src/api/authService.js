// ------------------------------------------------------------
// authService.js
// ------------------------------------------------------------
// Frontend auth API layer
// 所有和「认证 / 用户」相关的 HTTP 请求都集中在这里
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
  password,
  confirmPassword,
  code,
}) {
  const csrfToken = getCSRFToken();
  const res = await fetch(ENDPOINTS.AUTH_REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRFToken": csrfToken }),
    },
    credentials: "include", // ⭐ 允许 Django login() 写 session
    body: JSON.stringify({
      email,
      username,
      password,
      confirm_password: confirmPassword,
      code,
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
    credentials: "include", // ⭐ 用 session / JWT 都兼容
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  // 如果你后面用 JWT，可以存在 localStorage
  if (data.token) {
    localStorage.setItem("auth_token", data.token);
  }

  return data;
}

/* =========================
   Logout
   ========================= */
export async function logout() {
  // 1️⃣ 清本地 token
  localStorage.removeItem("auth_token");

  // 2️⃣ 通知后端（如果你实现了 /logout/）
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
    // 后端没实现也没关系
  }
}

/* =========================
   Get current user (optional)
   ========================= */
export async function getMe() {
  const res = await fetch(ENDPOINTS.AUTH_ME, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) return null;
  return await res.json();
}
