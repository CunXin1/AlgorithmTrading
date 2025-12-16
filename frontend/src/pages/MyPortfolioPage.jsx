// ------------------------------------------------------------
// MyPortfolioPage.jsx
// Route: /:username/myportfolio
// ------------------------------------------------------------
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WatchlistCard from "../components/dashboard/WatchlistCard";
import "../styles/myportfolio.css";
import { useRef } from "react";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

const API_BASE = import.meta.env.VITE_API_URL;

const DEFAULT_P1 = ["AAPL", "GOOGL", "NVDA"];
const DEFAULT_P2 = ["TSLA", "PLTR", "AMD"];

const COLORS = [
  "#4F46E5",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
];

// ---------------- Tooltip ----------------
function ExternalTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];

  return (
    <div className="donut-tooltip">
      <strong>{name}</strong> — {value.toFixed(2)}%
    </div>
  );
}

// ---------------- Donut (严格按你提供的结构，删 logo 部分) ----------------
function PortfolioDonutChart({ data, avatar }) {
  return (
    <div className="donut-wrapper">
      <PieChart width={220} height={220}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={100}
          paddingAngle={2}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip content={<ExternalTooltip />} wrapperStyle={{ zIndex: 999 }} />
      </PieChart>

      {/* 中心头像 */}
      <img src={avatar} alt="avatar" className="donut-avatar" />
    </div>
  );
}

function normalizeSymbol(s) {
  return String(s || "").trim().toUpperCase();
}

function parseQty(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(x) {
  if (typeof x !== "number" || Number.isNaN(x)) return "--";
  return `$${x.toFixed(2)}`;
}

export default function MyPortfolioPage() {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("/assets/defaultprofile.png");

  const [portfolio1, setPortfolio1] = useState(null);
  const [portfolio2, setPortfolio2] = useState(null);

  const [priceMap, setPriceMap] = useState({});
  const [tvSymbol, setTvSymbol] = useState("AAPL");

  // portfolio 右侧第一大排输入框
  const [p1Sym, setP1Sym] = useState("");
  const [p1Qty, setP1Qty] = useState("");
  const [p2Sym, setP2Sym] = useState("");
  const [p2Qty, setP2Qty] = useState("");
  const [hydrated, setHydrated] = useState(false);


  const saveTimerRef = useRef(null);

  /* ------------------------------
     Load profile + portfolios
     ------------------------------ */
  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(`${API_BASE}/api/core/profile/`, {
        credentials: "include",
      });

      if (!res.ok) {
        navigate("/login");
        return;
      }

      const data = await res.json();

      // 路由用户名不一致就跳回正确路由（你想要更严可去 403）
      if (routeUsername && data.username && routeUsername !== data.username) {
        navigate(`/${data.username}/myportfolio`);
        return;
      }

      setUsername(data.username);

      setAvatar(
        data.avatar ? `${API_BASE}${data.avatar}` : "/assets/defaultprofile.png"
      );

      const p1 =
        data.portfolio1 && Array.isArray(data.portfolio1.holdings)
          ? data.portfolio1
          : null;
      const p2 =
        data.portfolio2 && Array.isArray(data.portfolio2.holdings)
          ? data.portfolio2
          : null;

      const initP1 =
        p1 && p1.holdings.length
          ? p1
          : {
            name: (p1 && p1.name) || "Portfolio 1",
            holdings: DEFAULT_P1.map((s) => ({
              symbol: s,
              shares: 1,
              buy_price: null,
            })),
          };

      const initP2 =
        p2 && p2.holdings.length
          ? p2
          : {
            name: (p2 && p2.name) || "Portfolio 2",
            holdings: DEFAULT_P2.map((s) => ({
              symbol: s,
              shares: 1,
              buy_price: null,
            })),
          };

      setPortfolio1(initP1);
      setPortfolio2(initP2);

      setTvSymbol(initP1.holdings[0]?.symbol || "AAPL");
      setLoading(false);

      setPortfolio1(initP1);
      setPortfolio2(initP2);

      setTvSymbol(initP1.holdings[0]?.symbol || "AAPL");

      setLoading(false);
      setHydrated(true); // ✅ 非常关键：数据已从后端 hydrate 完成

    }

    loadProfile();
  }, [routeUsername, navigate]);

  /* ------------------------------
     Fetch prices once on enter
     API: /api/currentprice/<symbol>/
     ------------------------------ */
  useEffect(() => {
    if (!portfolio1 || !portfolio2) return;

    const symbols = [
      ...portfolio1.holdings.map((h) => normalizeSymbol(h.symbol)),
      ...portfolio2.holdings.map((h) => normalizeSymbol(h.symbol)),
    ];
    const uniq = [...new Set(symbols)].filter(Boolean);

    async function loadPrices() {
      const map = {};
      for (const sym of uniq) {
        try {
          const res = await fetch(`${API_BASE}/api/currentprice/${sym}/`, {
            credentials: "include",
          });
          if (res.ok) map[sym] = await res.json();
        } catch { }
      }
      setPriceMap(map);
    }

    loadPrices();
  }, [portfolio1, portfolio2]);

  /* ------------------------------
     Fill missing buy_price using current price (once prices arrive)
     ------------------------------ */
  useEffect(() => {
    if (!portfolio1 || !portfolio2) return;

    function fill(pf) {
      let changed = false;
      const next = pf.holdings.map((h) => {
        const sym = normalizeSymbol(h.symbol);
        const cur = priceMap[sym]?.price;
        if ((h.buy_price === null || h.buy_price === undefined) && typeof cur === "number") {
          changed = true;
          return { ...h, symbol: sym, buy_price: cur };
        }
        return { ...h, symbol: sym };
      });
      return changed ? { ...pf, holdings: next } : pf;
    }

    const p1 = fill(portfolio1);
    const p2 = fill(portfolio2);

    if (p1 !== portfolio1) setPortfolio1(p1);
    if (p2 !== portfolio2) setPortfolio2(p2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceMap]);


  /* */
  useEffect(() => {
    // ⛔️ 防止首次加载（hydrate）时立刻 PATCH
    if (!hydrated) return;
    if (!portfolio1 || !portfolio2) return;

    // debounce：500ms 内多次修改只保存一次
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      fetch(`${API_BASE}/api/core/profile/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolio1,
          portfolio2,
        }),
      }).catch(() => {
        // 静默失败即可；需要的话你以后可以加 toast
      });
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [hydrated, portfolio1, portfolio2]);



  /* ------------------------------
     Helpers
     ------------------------------ */
  function getCur(sym) {
    return priceMap[normalizeSymbol(sym)]?.price;
  }

  function positionValue(h) {
    const cur = getCur(h.symbol);
    const shares = Number(h.shares) || 0;
    return typeof cur === "number" ? cur * shares : 0;
  }

  function buildDonutData(pf) {
    const total = pf.holdings.reduce((s, h) => s + positionValue(h), 0);
    if (!total) return [];
    return pf.holdings.map((h) => ({
      name: normalizeSymbol(h.symbol),
      value: (positionValue(h) / total) * 100,
    }));
  }

  // 第二大排：Add（按输入 sym/qty）
  function addHolding(pf, setPf, symInput, qtyInput) {
    const sym = normalizeSymbol(symInput);
    const qty = parseQty(qtyInput);

    if (!sym || !qty || qty <= 0) return;

    const cur = getCur(sym);
    const idx = pf.holdings.findIndex((h) => normalizeSymbol(h.symbol) === sym);

    if (idx >= 0) {
      const old = pf.holdings[idx];
      const oldShares = Number(old.shares) || 0;
      const newShares = oldShares + qty;

      // buy_price 加权平均：old_buy*oldShares + cur*qty
      let newBuy = old.buy_price;
      if (typeof cur === "number") {
        const oldBuy = typeof old.buy_price === "number" ? old.buy_price : cur;
        newBuy = (oldBuy * oldShares + cur * qty) / newShares;
      }

      const next = pf.holdings.map((h, i) =>
        i === idx ? { ...h, shares: newShares, buy_price: newBuy } : h
      );
      setPf({ ...pf, holdings: next });
    } else {
      setPf({
        ...pf,
        holdings: [
          ...pf.holdings,
          {
            symbol: sym,
            shares: qty,
            buy_price: typeof cur === "number" ? cur : null,
          },
        ],
      });
    }
  }

  // 第二大排：Remove（按输入 sym/qty，减到<=0就删）
  function removeHolding(pf, setPf, symInput, qtyInput) {
    const sym = normalizeSymbol(symInput);
    const qty = parseQty(qtyInput);

    if (!sym || !qty || qty <= 0) return;

    const idx = pf.holdings.findIndex((h) => normalizeSymbol(h.symbol) === sym);
    if (idx < 0) return;

    const old = pf.holdings[idx];
    const oldShares = Number(old.shares) || 0;
    const newShares = oldShares - qty;

    if (newShares <= 0) {
      setPf({
        ...pf,
        holdings: pf.holdings.filter((h) => normalizeSymbol(h.symbol) !== sym),
      });
      return;
    }

    const next = pf.holdings.map((h, i) => (i === idx ? { ...h, shares: newShares } : h));
    setPf({ ...pf, holdings: next });
  }

  // 第三大排：X 删除整只
  function deleteHolding(pf, setPf, sym) {
    const s = normalizeSymbol(sym);
    setPf({
      ...pf,
      holdings: pf.holdings.filter((h) => normalizeSymbol(h.symbol) !== s),
    });
  }

  const p1Donut = useMemo(() => (portfolio1 ? buildDonutData(portfolio1) : []), [
    portfolio1,
    priceMap,
  ]);
  const p2Donut = useMemo(() => (portfolio2 ? buildDonutData(portfolio2) : []), [
    portfolio2,
    priceMap,
  ]);

  if (loading || !portfolio1 || !portfolio2) return null;

  return (
    <div className="myportfolio-page">
      <div className="mp-header">
        <h1>My Portfolio</h1>
        <p>Two portfolios. Add / remove by shares. Click a symbol to update the chart.</p>
      </div>

      <div className="mp-main">
        <div className="mp-portfolios">
          {/* Portfolio 1 */}
          <div className="portfolio-card">
            <div className="portfolio-inner">
              <div className="portfolio-donut">
                <PortfolioDonutChart data={p1Donut} avatar={avatar} />
              </div>

              <div className="portfolio-right">
                <input
                  className="portfolio-name"
                  value={portfolio1.name}
                  onChange={(e) => setPortfolio1({ ...portfolio1, name: e.target.value })}
                />

                {/* 第一大排：两个输入框 */}
                <div className="pf-input-row">
                  <input
                    className="symbol-input"
                    placeholder="Symbol"
                    value={p1Sym}
                    onChange={(e) => setP1Sym(e.target.value)}
                  />
                  <input
                    className="shares-input"
                    type="number"
                    placeholder="Shares"
                    value={p1Qty}
                    onChange={(e) => setP1Qty(e.target.value)}
                  />
                </div>

                {/* 第二大排：Add / Remove（只在这里保留） */}
                <div className="pf-action-row">
                  <button
                    className="btn primary"
                    onClick={() => addHolding(portfolio1, setPortfolio1, p1Sym, p1Qty || 1)}
                  >
                    Add
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => removeHolding(portfolio1, setPortfolio1, p1Sym, p1Qty || 1)}
                  >
                    Remove
                  </button>
                </div>

                {/* 第三大排：股票表格（滚动） */}
                <div className="pf-table">
                  {portfolio1.holdings.map((h) => {
                    const sym = normalizeSymbol(h.symbol);
                    const shares = Number(h.shares) || 0;
                    const buy = typeof h.buy_price === "number" ? h.buy_price : null;
                    const cur = getCur(sym);
                    const val = positionValue(h);

                    return (
                      <div className="pf-row" key={sym}>
                        {/* 行1：symbol + shares + X */}
                        <div className="pf-row-top" onClick={() => setTvSymbol(sym)}>
                          <div className="pf-row-left">
                            <span className="pf-sym">{sym}</span>
                            <span className="pf-shares">{shares} shares</span>
                          </div>

                          <button
                            className="pf-x"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHolding(portfolio1, setPortfolio1, sym);
                            }}
                            aria-label="Delete holding"
                          >
                            ×
                          </button>
                        </div>

                        {/* 行3：4字段 */}
                        <div className="pf-row-info">
                          <div className="cell">
                            <div className="k">Shares</div>
                            <div className="v">{shares}</div>
                          </div>
                          <div className="cell">
                            <div className="k">Buy</div>
                            <div className="v">{buy === null ? "--" : fmtMoney(buy)}</div>
                          </div>
                          <div className="cell">
                            <div className="k">Current</div>
                            <div className="v">{typeof cur === "number" ? fmtMoney(cur) : "--"}</div>
                          </div>
                          <div className="cell">
                            <div className="k">Value</div>
                            <div className="v">{fmtMoney(val)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio 2 */}
          <div className="portfolio-card">
            <div className="portfolio-inner">
              <div className="portfolio-donut">
                <PortfolioDonutChart data={p2Donut} avatar={avatar} />
              </div>

              <div className="portfolio-right">
                <input
                  className="portfolio-name"
                  value={portfolio2.name}
                  onChange={(e) => setPortfolio2({ ...portfolio2, name: e.target.value })}
                />

                <div className="pf-input-row">
                  <input
                    className="symbol-input"
                    placeholder="Symbol"
                    value={p2Sym}
                    onChange={(e) => setP2Sym(e.target.value)}
                  />
                  <input
                    className="shares-input"
                    type="number"
                    placeholder="Shares"
                    value={p2Qty}
                    onChange={(e) => setP2Qty(e.target.value)}
                  />
                </div>

                <div className="pf-action-row">
                  <button
                    className="btn primary"
                    onClick={() => addHolding(portfolio2, setPortfolio2, p2Sym, p2Qty || 1)}
                  >
                    Add
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => removeHolding(portfolio2, setPortfolio2, p2Sym, p2Qty || 1)}
                  >
                    Remove
                  </button>
                </div>

                <div className="pf-table">
                  {portfolio2.holdings.map((h) => {
                    const sym = normalizeSymbol(h.symbol);
                    const shares = Number(h.shares) || 0;
                    const buy = typeof h.buy_price === "number" ? h.buy_price : null;
                    const cur = getCur(sym);
                    const val = positionValue(h);

                    return (
                      <div className="pf-row" key={sym}>
                        <div className="pf-row-top" onClick={() => setTvSymbol(sym)}>
                          <div className="pf-row-left">
                            <span className="pf-sym">{sym}</span>
                            <span className="pf-shares">{shares} shares</span>
                          </div>

                          <button
                            className="pf-x"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHolding(portfolio2, setPortfolio2, sym);
                            }}
                            aria-label="Delete holding"
                          >
                            ×
                          </button>
                        </div>

                        <div className="pf-row-info">
                          <div className="cell">
                            <div className="k">Shares</div>
                            <div className="v">{shares}</div>
                          </div>
                          <div className="cell">
                            <div className="k">Buy</div>
                            <div className="v">{buy === null ? "--" : fmtMoney(buy)}</div>
                          </div>
                          <div className="cell">
                            <div className="k">Current</div>
                            <div className="v">{typeof cur === "number" ? fmtMoney(cur) : "--"}</div>
                          </div>
                          <div className="cell">
                            <div className="k">Value</div>
                            <div className="v">{fmtMoney(val)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* 右侧 Watchlist（不额外套卡片；右列变窄由 CSS 控制） */}
        <div className="mp-watchlist-slot">
          <WatchlistCard onSelect={(s) => setTvSymbol(normalizeSymbol(s))} />
        </div>
      </div>

      <hr className="mp-divider" />

      <div className="mp-tv-wrapper">
        <div className="mp-tv-card">
          <TradingViewChart symbol={tvSymbol} />
        </div>
      </div>

      <hr className="mp-divider" />
    </div>
  );
}
