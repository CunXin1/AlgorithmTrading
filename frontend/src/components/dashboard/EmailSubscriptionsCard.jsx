import React, { useEffect, useState } from "react";

const LS_SUBS_KEY = "dashboard_email_subs_v1";
const MAX_EMAILS = 3;

function normalizeEmail(e) {
  return String(e || "").trim().toLowerCase();
}

function isValidEmail(email) {
  // 简单够用：后端会再严格校验
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EmailSubscriptionsCard() {
  const [subs, setSubs] = useState([]); // [{id, email, enabled}]
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SUBS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSubs(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SUBS_KEY, JSON.stringify(subs));
    } catch {
      // ignore
    }
  }, [subs]);

  function addEmail() {
    const email = normalizeEmail(emailInput);
    if (!email) return;
    if (!isValidEmail(email)) return;
    if (subs.length >= MAX_EMAILS) return;
    if (subs.some((x) => x.email === email)) return;

    const item = { id: crypto.randomUUID(), email, enabled: true };
    setSubs((prev) => [...prev, item]);
    setEmailInput("");
  }

  function toggle(id) {
    setSubs((prev) =>
      prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x))
    );
  }

  function remove(id) {
    setSubs((prev) => prev.filter((x) => x.id !== id));
  }

  const canAdd = subs.length < MAX_EMAILS;

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Market Sentiment Email</h3>
        <div className="dash-badge">
          {subs.length}/{MAX_EMAILS}
        </div>
      </div>

      <div className="dash-hint" style={{ marginBottom: 10 }}>
        每个用户最多订阅 3 个邮箱。后面接后端：/api/subscriptions/
      </div>

      <div className="watchlist-add">
        <input
          className="dash-input"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="name@example.com"
          disabled={!canAdd}
        />
        <button
          className="dash-btn primary"
          type="button"
          onClick={addEmail}
          disabled={!canAdd}
          title={!canAdd ? "Max 3 emails" : "Add email"}
        >
          + Add
        </button>
      </div>

      {subs.length === 0 ? (
        <div className="dash-empty">
          No subscriptions. Add up to 3 emails.
        </div>
      ) : (
        <ul className="dash-list">
          {subs.map((x) => (
            <li key={x.id} className="dash-row">
              <div className="dash-row-left">
                <div className="dash-row-title">{x.email}</div>
                <div className="dash-row-sub">
                  {x.enabled ? "Enabled" : "Disabled"}
                </div>
              </div>

              <div className="dash-row-actions">
                <button
                  className={`dash-toggle ${x.enabled ? "on" : "off"}`}
                  type="button"
                  onClick={() => toggle(x.id)}
                  title="Enable/Disable"
                >
                  {x.enabled ? "On" : "Off"}
                </button>
                <button
                  className="dash-x"
                  type="button"
                  onClick={() => remove(x.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
