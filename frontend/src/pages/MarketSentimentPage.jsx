// src/pages/MarketSentimentPage.jsx
import { useEffect, useMemo, useState } from "react";
import ChartComponent from "../components/ChartComponent";
import "../styles/MarketSentimentPage.css";
import { normalizeRating, getSentimentClass, formatScore } from "../utils/sentimentUtils";

const API_BASE = import.meta.env.VITE_API_URL;

const CORE_INDEX = "fear_and_greed";

const OTHER_INDEXES = [
    "market_momentum_sp500",
    "market_momentum_sp125",
    "stock_price_strength",
    "stock_price_breadth",
    "put_call_options",
    "market_volatility_vix",
    "market_volatility_vix_50",
    "junk_bond_demand",
    "safe_haven_demand",
];

const LABELS = {
    fear_and_greed: "Fear & Greed Index",
    market_momentum_sp500: "Market Momentum (S&P 500)",
    market_momentum_sp125: "Market Momentum (S&P 125)",
    stock_price_strength: "Stock Price Strength",
    stock_price_breadth: "Stock Price Breadth",
    put_call_options: "Put/Call Options",
    market_volatility_vix: "Market Volatility (VIX)",
    market_volatility_vix_50: "Market Volatility (VIX-50)",
    junk_bond_demand: "Junk Bond Demand",
    safe_haven_demand: "Safe Haven Demand",
};

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${url}\n${txt}`);
    }
    return await res.json();
}

async function handleToggleAlert() {
    if (!email) return;

    if (!enabled) {
        await fetch(`${API_BASE}/api/alerts/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setEnabled(true);
    } else {
        await fetch(`${API_BASE}/api/alerts/subscribe`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setEnabled(false);
    }
}

export default function MarketSentimentPage() {
    const [rangeDays, setRangeDays] = useState(365);
    const [fgSeries, setFgSeries] = useState([]);
    const [seriesMap, setSeriesMap] = useState({});
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [alertEnabled, setAlertEnabled] = useState(false);


    // Fetch F&G
    useEffect(() => {
        let cancelled = false;
        setError("");

        fetchJSON(`${API_BASE}/api/sentiment/index/${CORE_INDEX}/history/?days=${rangeDays}`)
            .then((data) => {
                if (!cancelled) setFgSeries(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                if (!cancelled) setError(String(e.message || e));
            });

        return () => {
            cancelled = true;
        };
    }, [rangeDays]);

    // Fetch 9 sub-indices
    useEffect(() => {
        let cancelled = false;
        setError("");

        (async () => {
            try {
                const results = await Promise.all(
                    OTHER_INDEXES.map((idx) =>
                        fetchJSON(`${API_BASE}/api/sentiment/index/${idx}/history/?days=365`).then((data) => [
                            idx,
                            Array.isArray(data) ? data : [],
                        ])
                    )
                );

                if (cancelled) return;

                const next = {};
                for (const [idx, data] of results) next[idx] = data;
                setSeriesMap(next);
            } catch (e) {
                if (!cancelled) setError(String(e.message || e));
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Latest F&G value
    const fgLatest = useMemo(() => {
        if (!fgSeries || fgSeries.length === 0) return null;
        return fgSeries[fgSeries.length - 1];
    }, [fgSeries]);

    console.log("LATEST FG:", fgLatest);

    const fgSentiment = fgLatest ? normalizeRating(fgLatest.rating) : null;
    const fgBadgeClass = fgSentiment ? getSentimentClass(fgSentiment) : "badge-neutral";

    // Sub cards (DO NOT compute sentiment here)
    const smallCards = useMemo(() => {
        return OTHER_INDEXES.map((idx) => {
            const series = seriesMap[idx] || [];
            const latest = series.length ? series[series.length - 1] : null;
            return { idx, label: LABELS[idx] || idx, series, latest };
        });
    }, [seriesMap]);

    return (
        <div className="ms-page">
            <div className="ms-navbar-spacer" />

            <div className="ms-header">
                <h1 className="ms-title">Market Sentiment</h1>
                <p className="ms-subtitle">
                    Fear &amp; Greed-style indicators summarize risk appetite across momentum, volatility, options activity,
                    credit demand, and safe-haven flows.
                </p>
            </div>

            {error && (
                <div className="ms-error-card">
                    <div className="ms-error-title">Error</div>
                    <div className="ms-error-msg">{error}</div>
                </div>
            )}

            <div className="ms-top-row">
                <div className="ms-card ms-card-large">
                    <div className="ms-card-top">
                        <div>
                            <div className="ms-card-title">{LABELS[CORE_INDEX]}</div>
                            <div className="ms-card-desc">
                                Composite sentiment gauge (0–100). Lower indicates fear-driven conditions; higher indicates greed and
                                risk-taking.
                            </div>
                        </div>

                        <div className={`ms-current-box ${fgSentiment ? fgBadgeClass : "badge-neutral"}`}>{fgLatest ? (
                            <>
                                <div className="ms-current-value">
                                    {formatScore(fgLatest.score)}
                                </div>
                                <div className="ms-current-sentiment">
                                    {fgSentiment}
                                </div>
                            </>
                        ) : (
                            <div className="ms-current-text">Loading</div>
                        )}
                        </div>

                    </div>

                    <div className="ms-range">
                        {[30, 60, 365].map((d) => (
                            <button
                                key={d}
                                className={`ms-chip ${rangeDays === d ? "active" : ""}`}
                                onClick={() => setRangeDays(d)}
                            >
                                {d === 365 ? "1Y" : `${d}D`}
                            </button>
                        ))}
                    </div>

                    <div className="ms-chart-wrap">
                        <ChartComponent
                            title={LABELS[CORE_INDEX]}
                            points={fgSeries}
                            rangeDays={rangeDays}
                            yFixed0100
                            height={380}
                            compact={false}
                        />
                    </div>
                </div>

                {/* ===== Email Alert Subscription ===== */}
                <div className="ms-alert-box">
                    <div className="ms-alert-title">
                        Get Fear & Greed Alerts
                    </div>

                    <div className="ms-alert-desc">
                        Receive an email when the Fear & Greed Index enters or exits extreme conditions.
                    </div>

                    <div className="ms-alert-form">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="ms-alert-input"
                        />

                        <button
                            className={`ms-alert-btn ${alertEnabled ? "on" : "off"}`}
                            onClick={() => setAlertEnabled((v) => !v)}
                        >
                            {alertEnabled ? "Disable" : "Enable"}
                        </button>
                        

                    </div>
                </div>


                <div className="ms-top-spacer" />
            </div>

            <div className="ms-grid-3">
                {smallCards.map(({ idx, label, series, latest }) => {
                    const sentiment = latest ? normalizeRating(latest.rating) : null;
                    const badgeClass = sentiment ? getSentimentClass(sentiment) : "badge-neutral";

                    return (
                        <div className="ms-card ms-card-small" key={idx}>
                            <div className="ms-small-top">
                                <div className="ms-small-title">{label}</div>

                                <div className="ms-small-right">
                                    <div className="ms-small-score">
                                        {latest ? formatScore(latest.score) : "—"}
                                    </div>

                                    {latest && (
                                        <div className={`ms-badge ms-badge-small ${badgeClass}`}>
                                            {sentiment}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ms-small-chart">
                                <ChartComponent
                                    title={label}
                                    points={series}
                                    rangeDays={365}
                                    yFixed0100={false}
                                    height={200}
                                    compact
                                />
                            </div>

                            <div className="ms-small-foot">
                                <span className="ms-foot-note">
                                    {latest?.date ? `Latest: ${latest.date}` : ""}
                                </span>
                                <span className="ms-foot-note">1Y • Independent Y</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="ms-source">
                Source: RapidAPI (CNN Fear &amp; Greed-style indicators).
            </div>
        </div>
    );
}
