import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;
const MAX_EMAILS = 3;

function getCSRFToken() {
  const name = "csrftoken=";
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(name)) return c.slice(name.length);
  }
  return "";
}

function normalizeEmail(e) {
  return String(e || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function useEmailSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  async function reloadSubs() {
    const res = await fetch(`${API_BASE}/api/core/email-subscription/`, {
      credentials: "include",
    });
    const data = await res.json();
    setSubs(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    reloadSubs();
  }, []);

  async function handleAddEmail() {
    const email = normalizeEmail(emailInput);
    if (!email || !isValidEmail(email)) return;
    if (subs.length >= MAX_EMAILS) return;

    await fetch(`${API_BASE}/api/core/email-subscription/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ email }),
    });

    setEmailInput("");
    reloadSubs();
  }

  async function toggleEmail(id) {
    const target = subs.find((x) => x.id === id);
    if (!target) return;

    await fetch(`${API_BASE}/api/core/email-subscription/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ id, enabled: !target.enabled }),
    });

    reloadSubs();
  }

  async function removeEmail(id) {
    await fetch(`${API_BASE}/api/core/email-subscription/`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ id }),
    });

    reloadSubs();
  }

  return {
    subs,
    emailInput,
    setEmailInput,
    handleAddEmail,
    toggleEmail,
    removeEmail,
    MAX_EMAILS,
  };
}
