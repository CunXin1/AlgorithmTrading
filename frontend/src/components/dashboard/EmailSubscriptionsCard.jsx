import React, { useState } from "react";

const MAX_EMAILS = 3;

function normalizeEmail(e) {
  return String(e || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EmailSubCard() {
  const [subs, setSubs] = useState([]); // [{ id, email, enabled }]
  const [input, setInput] = useState("");

  function handleAdd() {
    const email = normalizeEmail(input);
    if (!email) return;
    if (!isValidEmail(email)) return;
    if (subs.length >= MAX_EMAILS) return;
    if (subs.some((x) => x.email === email)) return;

    setSubs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email, enabled: true },
    ]);
    setInput("");
  }

  function toggle(id) {
    setSubs((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, enabled: !x.enabled } : x
      )
    );
  }

  function remove(id) {
    setSubs((prev) => prev.filter((x) => x.id !== id));
  }

  return (
  <div className="dash-card">
    {/* ===== Header ===== */}
    <div className="dash-card-header">
      <h3 className="dash-card-title">Market Sentiment Email</h3>
      <div className="dash-badge">
        {subs.length}/{MAX_EMAILS}
      </div>
    </div>

    {/* ===== Description ===== */}
    <div className="dash-hint" style={{ marginBottom: 10 }}>
      Receive email alerts for Fear &amp; Greed Index
    </div>

    {/* ===== Add email ===== */}
    <div className="watchlist-add">
      <input
        className="dash-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="name@example.com"
        disabled={subs.length >= MAX_EMAILS}
      />
      <button
        className="dash-btn primary"
        type="button"
        onClick={handleAdd}
        disabled={subs.length >= MAX_EMAILS}
        title={
          subs.length >= MAX_EMAILS
            ? "Maximum 3 emails"
            : "Add email"
        }
      >
        Add
      </button>
    </div>

    {/* ===== Scrollable list (IMPORTANT PART) ===== */}
    {subs.length === 0 ? (
      <div className="dash-empty">
        No email subscriptions yet.
      </div>
    ) : (
      <ul className="dash-list dash-list-scroll">
        {subs.map((x) => (
          <li key={x.id} className="dash-row">
            <div className="dash-row-left">
              <div className="dash-row-title">
                {x.email}
              </div>
            </div>

            <div className="dash-row-actions">
              <button
                className={`dash-toggle ${
                  x.enabled ? "on" : "off"
                }`}
                type="button"
                onClick={() => toggle(x.id)}
              >
                {x.enabled ? "On" : "Off"}
              </button>
              <button
                className="dash-x"
                type="button"
                onClick={() => remove(x.id)}
                title="Remove"
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