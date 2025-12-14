import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================
   Utils: forward-fill prices
   ========================= */
function normalizePrices(raw) {
    const result = [];
    let lastValid = null;

    for (const v of raw) {
        if (Number.isFinite(v) && v > 0) {
            lastValid = v;
            result.push(v);
        } else if (lastValid !== null) {
            result.push(lastValid);
        }
    }

    return result;
}

/* =========================
   Minute Chart with Axes + Hover
   ========================= */
function MinuteChart({ data }) {
    if (!Array.isArray(data) || data.length < 2) return null;
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });


    const [hoverIdx, setHoverIdx] = useState(null);

    const width = 420;
    const height = 150;
    const padLeft = 46;
    const padRight = 12;
    const padTop = 12;
    const padBottom = 32;

    const rawCloses = data.map(d => Number(d.close));
    const closes = normalizePrices(rawCloses);
    if (closes.length < 2) return null;

    /* VWAP */
    let cumPV = 0;
    let cumVol = 0;
    const vwapSeries = [];

    data.forEach((d) => {
        const price = Number(d.close);
        const vol = Number(d.volume);

        if (price > 0 && vol > 0) {
            cumPV += price * vol;
            cumVol += vol;
        }

        if (cumVol > 0) {
            vwapSeries.push(cumPV / cumVol);
        } else if (vwapSeries.length > 0) {
            vwapSeries.push(vwapSeries[vwapSeries.length - 1]);
        }
    });

    const high = Math.max(...closes);
    const low = Math.min(...closes);
    const range = high - low || 1;

    function yOf(p) {
        return (
            padTop +
            (1 - (p - low) / range) * (height - padTop - padBottom)
        );
    }

    function xOf(i) {
        return (
            padLeft +
            (i / (closes.length - 1)) * (width - padLeft - padRight)
        );
    }

    function indexFromEvent(evt) {
        const svg = evt.currentTarget;
        const pt = svg.createSVGPoint();

        pt.x = evt.clientX;
        pt.y = evt.clientY;

        const cursor = pt.matrixTransform(
            svg.getScreenCTM().inverse()
        );

        const x = cursor.x;

        const chartWidth = width - padLeft - padRight;
        const ratio = (x - padLeft) / chartWidth;
        const idx = Math.round(ratio * (closes.length - 1));

        if (idx < 0 || idx >= closes.length) return null;
        return idx;
    }


    const yTicks = Array.from({ length: 5 }, (_, i) =>
        low + range * (i / 4)
    ).reverse();

    const xTicks = [
        { label: "09:30", idx: 0 },
        { label: "12:00", idx: Math.floor(closes.length * 0.38) },
        { label: "14:00", idx: Math.floor(closes.length * 0.7) },
        { label: "16:00", idx: closes.length - 1 },
    ];

    const hoverTime =
        hoverIdx !== null ? data[hoverIdx].time.slice(11, 16) : null;

    return (
        <div style={{ position: "relative" }}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                style={{ width: "100%", height: "190px", display: "block" }}
                onMouseMove={(e) => {
                    setHoverIdx(indexFromEvent(e));

                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                    });
                }}

                onMouseLeave={() => setHoverIdx(null)}
            >
                {/* Axes */}
                <line x1={padLeft} y1={padTop} x2={padLeft} y2={height - padBottom} stroke="#e5e7eb" />
                <line x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} stroke="#e5e7eb" />

                {/* Y axis */}
                {yTicks.map((p, i) => (
                    <g key={i}>
                        <line x1={padLeft - 4} y1={yOf(p)} x2={padLeft} y2={yOf(p)} stroke="#e5e7eb" />
                        <text x={padLeft - 6} y={yOf(p) + 4} fontSize="10" fill="#6b7280" textAnchor="end">
                            ${p.toFixed(2)}
                        </text>
                    </g>
                ))}

                {/* X axis */}
                {xTicks.map(t => (
                    <text key={t.label} x={xOf(t.idx)} y={height - 8} fontSize="10" fill="#6b7280" textAnchor="middle">
                        {t.label}
                    </text>
                ))}

                {/* Price */}
                <polyline
                    points={closes.map((p, i) => `${xOf(i)},${yOf(p)}`).join(" ")}
                    fill="none"
                    stroke="#1a73e8"
                    strokeWidth="2"
                />

                {/* VWAP */}
                <polyline
                    points={vwapSeries.map((p, i) => `${xOf(i)},${yOf(p)}`).join(" ")}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2"
                />

                {/* Hover */}
                {hoverIdx !== null && (
                    <>
                        <line
                            x1={xOf(hoverIdx)}
                            x2={xOf(hoverIdx)}
                            y1={padTop}
                            y2={height - padBottom}
                            stroke="#9ca3af"
                            strokeDasharray="3 3"
                        />
                        <circle cx={xOf(hoverIdx)} cy={yOf(closes[hoverIdx])} r="3" fill="#1a73e8" />
                        <circle cx={xOf(hoverIdx)} cy={yOf(vwapSeries[hoverIdx])} r="3" fill="#f59e0b" />
                    </>
                )}
            </svg>

            {hoverIdx !== null && (
                <div
                    style={{
                        position: "absolute",
                        left: mousePos.x + 12,
                        top: mousePos.y + 12,

                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        pointerEvents: "none",
                        zIndex: 9999,
                    }}
                >
                    <div style={{ whiteSpace: "nowrap" }}>
                        Price: ${closes[hoverIdx].toFixed(2)}
                    </div>
                    <div style={{ whiteSpace: "nowrap" }}>
                        VWAP: ${vwapSeries[hoverIdx].toFixed(2)}
                    </div>

                </div>
            )}
        </div>
    );
}

/* =========================
   Market Card
   ========================= */
function MarketCard({ symbol, name }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/stocks/${symbol.toLowerCase()}/`)
            .then(r => r.json())
            .then(j => !cancelled && setData(j.data || []))
            .finally(() => !cancelled && setLoading(false));
        return () => (cancelled = true);
    }, [symbol]);

    const closes = normalizePrices(data.map(d => Number(d.close)));
    const first = closes[0];
    const last = closes[closes.length - 1];
    const pct = first && last ? ((last - first) / first) * 100 : 0;

    return (
        <div className="market-card" style={{ width: "46%", height: "300px", padding: "16px" }}>
            <div className="market-card-top">
                <div>
                    <div className="market-symbol clickable" onClick={() => navigate(`/stock/${symbol.toLowerCase()}`)}>
                        {symbol}
                    </div>
                    <div className="market-name">{name}</div>
                </div>
                {!loading && (
                    <div className={`market-pct ${pct >= 0 ? "up" : "down"}`}>
                        <span className="market-pct-label">Today:</span>{" "}
                        {pct >= 0 ? "+" : ""}
                        {pct.toFixed(2)}%
                    </div>
                )}
            </div>

            <div className="market-price">${last?.toFixed(2)}</div>

            {loading ? <div style={{ height: 150 }}>Loading…</div> : <MinuteChart data={data} />}
        </div>
    );
}

/* =========================
   Market Cards Row
   ========================= */
export default function MarketCardsRow() {
    return (
        <div className="market-row" style={{ display: "flex", gap: "2%", justifyContent: "center" }}>
            <MarketCard symbol="QQQ" name="Invesco QQQ" />
            <MarketCard symbol="SPY" name="SPDR S&P 500" />
        </div>
    );
}
