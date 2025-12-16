// ------------------------------------------------------------
// MyPortfolioPage.jsx
// Route: /:username/myportfolio
// ------------------------------------------------------------
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InvestorDonutChart from "../components/InvestorDonutChart";
import TradingViewChart from "../components/TradingViewChart";
import WatchlistCard from "../components/dashboard/WatchlistCard";

import "../styles/myportfolio.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function MyPortfolioPage() {
  const { username: routeUsername } = useParams();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);

  const [portfolio1, setPortfolio1] = useState(null);
  const [portfolio2, setPortfolio2] = useState(null);

  const [priceMap, setPriceMap] = useState({});
  const [tvSymbol, setTvSymbol] = useState("AAPL");

  /* ------------------------------
     Load profile + portfolios
     ------------------------------ */
  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(`${API_BASE}/api/core/profile/`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();

      setUsername(data.username);
      setAvatar(
        data.avatar ? `${API_BASE}${data.avatar}` : null
      );

      setPortfolio1(
        data.portfolio1 || { name: "Portfolio 1", holdings: [] }
      );
      setPortfolio2(
        data.portfolio2 || { name: "Portfolio 2", holdings: [] }
      );

      setLoading(false);
    }

    loadProfile();
  }, [routeUsername]);

  /* ------------------------------
     Fetch prices once on enter
     ------------------------------ */
  useEffect(() => {
    if (!portfolio1 || !portfolio2) return;

    const symbols = [
      ...portfolio1.holdings.map((h) => h.symbol),
      ...portfolio2.holdings.map((h) => h.symbol),
    ];

    const uniq = [...new Set(symbols)];

    async function loadPrices() {
      const map = {};

      for (const sym of uniq) {
        try {
          const res = await fetch(`${API_BASE}/api/currentprice/${sym}/`, {
            credentials: "include",
          })

          if (res.ok) {
            map[sym] = await res.json();
          }
        } catch { }
      }

      setPriceMap(map);
    }

    loadPrices();
  }, [portfolio1, portfolio2]);

  /* ------------------------------
     Helpers
     ------------------------------ */
  function positionValue(h) {
    const p = priceMap[h.symbol]?.price;
    return p ? p * h.shares : 0;
  }

  function buildDonutData(portfolio) {
    const total = portfolio.holdings.reduce(
      (s, h) => s + positionValue(h),
      0
    );

    if (!total) return [];

    return portfolio.holdings.map((h) => ({
      name: h.symbol,
      value: (positionValue(h) / total) * 100,
    }));
  }

  function addHolding(pf, setPf, symbol, shares) {
    const sym = symbol.trim().toUpperCase();
    const qty = Number(shares);

    if (!sym || !qty || qty <= 0) return;

    const exists = pf.holdings.find((h) => h.symbol === sym);

    if (exists) {
      setPf({
        ...pf,
        holdings: pf.holdings.map((h) =>
          h.symbol === sym
            ? { ...h, shares: h.shares + qty }
            : h
        ),
      });
    } else {
      setPf({
        ...pf,
        holdings: [...pf.holdings, { symbol: sym, shares: qty }],
      });
    }
  }

  if (loading) return null;

  return (
    <div className="myportfolio-page">
      {/* ---------------- Header ---------------- */}
      <div className="mp-header">
        <h1>My Portfolio</h1>
        <p>
          Create up to two portfolios. Add stocks by shares and
          visualize allocation.
        </p>
      </div>

      {/* ---------------- Main ---------------- */}
      <div className="mp-main">
        {/* Left: portfolios */}
        <div className="mp-portfolios">
          {[portfolio1, portfolio2].map((pf, idx) => {
            const setPf = idx === 0 ? setPortfolio1 : setPortfolio2;

            return (
              <div className="portfolio-card" key={idx}>
                <div className="portfolio-inner">
                  {/* Left: Donut */}
                  <div className="portfolio-donut">
                    <InvestorDonutChart
                      data={buildDonutData(pf)}
                      avatar={avatar}
                    />
                  </div>

                  {/* Right: Controls */}
                  <div className="portfolio-right">
                    <input
                      className="portfolio-name"
                      value={pf.name}
                      onChange={(e) =>
                        setPf({ ...pf, name: e.target.value })
                      }
                    />

                    <div className="portfolio-search">
                      <input
                        placeholder="Symbol"
                        className="symbol-input"
                        id={`sym-${idx}`}
                      />
                      <input
                        type="number"
                        placeholder="Shares"
                        className="shares-input"
                        id={`qty-${idx}`}
                      />
                      <button
                        onClick={() =>
                          addHolding(
                            pf,
                            setPf,
                            document.getElementById(`sym-${idx}`).value,
                            document.getElementById(`qty-${idx}`).value
                          )
                        }
                      >
                        Add
                      </button>
                    </div>

                    <ul className="holdings">
                      {pf.holdings.map((h) => (
                        <li
                          key={h.symbol}
                          onClick={() => setTvSymbol(h.symbol)}
                        >
                          <span>{h.symbol}</span>
                          <span>{h.shares} sh</span>
                          <span>
                            $
                            {priceMap[h.symbol]?.price ?? "--"}
                          </span>
                          <span>
                            ${positionValue(h).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: watchlist (no wrapper) */}
        <WatchlistCard onSelect={(s) => setTvSymbol(s)} />
      </div>

      {/* ---------------- Divider ---------------- */}
      <hr className="mp-divider" />

      {/* ---------------- TradingView ---------------- */}
      <div className="mp-tv-wrapper">
        <div className="mp-tv-card">
          <TradingViewChart symbol={tvSymbol} />
        </div>
      </div>

      {/* ---------------- Footer Divider ---------------- */}
      <hr className="mp-divider" />
    </div>
  );
}
