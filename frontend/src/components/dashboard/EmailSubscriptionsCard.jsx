import React from "react";

export default function EmailSubCard({
  subs,
  input,
  setInput,
  handleAdd,
  toggle,
  remove,
  MAX_EMAILS,
}) {
  // ✅ fail fast：父组件没传就直接炸
  if (!Array.isArray(subs)) {
    throw new Error("Email: `subs` must be an array");
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

    {/* ===== Add email (hidden when max reached) ===== */}
    {subs.length < MAX_EMAILS && (
      <div className="watchlist-add">
        <input
          className="dash-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="name@example.com"
        />
        <button
          className="dash-btn primary"
          type="button"
          onClick={handleAdd}
          title="Add email"
        >
          Add
        </button>
      </div>
    )}

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