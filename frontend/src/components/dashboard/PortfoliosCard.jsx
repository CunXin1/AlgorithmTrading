import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function PortfoliosCard() {
  const navigate = useNavigate();

  // MVP：先 mock（后面接 GET /api/portfolios/）
  const portfolios = useMemo(
    () => [
      { id: "p1", name: "Core Tech", updatedAt: "2025-12-10" },
      { id: "p2", name: "Options Sprint", updatedAt: "2025-12-08" },
    ],
    []
  );

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">My Portfolio</h3>
        <button
          className="dash-btn primary"
          type="button"
          onClick={() => navigate("/myportfolio")}
        >
          Open
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="dash-empty">No portfolio yet.</div>
      ) : (
        <ul className="dash-list">
          {portfolios.map((p) => (
            <li key={p.id} className="dash-row">
              <div className="dash-row-left">
                <div className="dash-row-title">{p.name}</div>
                <div className="dash-row-sub">Updated: {p.updatedAt}</div>
              </div>
              <button
                className="dash-link"
                type="button"
                onClick={() => navigate("/myportfolio")}
                title="Go to MyPortfolio"
              >
                View →
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="dash-hint" style={{ marginTop: 10 }}>
        后面接后端：GET /api/portfolios/（只要当前用户列表）
      </div>
    </div>
  );
}
