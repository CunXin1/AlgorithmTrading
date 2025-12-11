// ------------------------------------------------------------
// authService.js
// ------------------------------------------------------------
// Node backend talks to Django backend here.
//
// Node 后端通过此文件与 Django 通信。
// ------------------------------------------------------------

import axios from "axios";

const DJANGO_BASE = process.env.DJANGO_URL || "https://your-django-app-url.com";

// ------------------------------------------------------------
// Login → Django
// ------------------------------------------------------------
export async function loginRequest(email, password) {
  try {
    const res = await axios.post(`${DJANGO_BASE}/django-api/auth/login`, {
      email,
      password,
    });

    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Login failed");
  }
}

// ------------------------------------------------------------
// Register → Django
// ------------------------------------------------------------
export async function registerRequest(email, password) {
  try {
    const res = await axios.post(`${DJANGO_BASE}/django-api/auth/register`, {
      email,
      password,
    });

    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Register failed");
  }
}
