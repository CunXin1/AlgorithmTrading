// src/components/ChartComponent.jsx
import { Chart } from "react-google-charts";

/**
 * Google Charts LineChart wrapper
 * - Smart X-axis ticks based on rangeDays
 * - Independent Y-axis domain by default (unless yFixed0100 is true)
 * - Compact mode for small cards
 */

function buildXTicks(points, rangeDays) {
  if (!points || points.length === 0) return [];

  const dates = points.map((p) => new Date(p.date)).sort((a, b) => a - b);
  const start = dates[0];
  const end = dates[dates.length - 1];

  const ticks = [];

  if (rangeDays >= 300) {
    // 1Y: show months (clean)
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) {
      ticks.push(new Date(d));
      d.setMonth(d.getMonth() + 1);
    }
  } else if (rangeDays >= 55) {
    // 60D: weekly ticks
    const d = new Date(start);
    d.setHours(0, 0, 0, 0);
    while (d <= end) {
      ticks.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
  } else {
    // 30D: every ~5 days to avoid overlap
    const d = new Date(start);
    d.setHours(0, 0, 0, 0);
    while (d <= end) {
      ticks.push(new Date(d));
      d.setDate(d.getDate() + 5);
    }
  }

  // Add end tick if far away from last tick
  if (ticks.length > 0) {
    const last = ticks[ticks.length - 1];
    if (Math.abs(end - last) > 7 * 24 * 3600 * 1000) ticks.push(new Date(end));
  }

  return ticks;
}

function computeYDomain(points) {
  if (!points || points.length === 0) return { min: 0, max: 100 };

  let min = Infinity;
  let max = -Infinity;

  for (const p of points) {
    const v = Number(p.score);
    if (Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 100 };

  const span = max - min;
  const pad = span === 0 ? Math.max(1, Math.abs(max) * 0.05) : span * 0.12;

  return { min: min - pad, max: max + pad };
}

export default function ChartComponent({
  title,
  points,
  rangeDays = 365,
  height = 280,
  compact = false,
  yFixed0100 = false,
}) {
  const chartData = [
    ["Date", title],
    ...(points || []).map((p) => [new Date(p.date), Number(p.score)]),
  ];

  const ticks = buildXTicks(points || [], rangeDays);
  const yDomain = yFixed0100 ? { min: 0, max: 100 } : computeYDomain(points || []);

  const options = {
    legend: { position: "none" },
    backgroundColor: "transparent",
    colors: ["#1a73e8"], // Google blue

    chartArea: compact
      ? { left: 38, top: 10, width: "88%", height: "75%" }
      : { left: 52, top: 18, width: "90%", height: "74%" },

    hAxis: {
      ticks,
      // 1Y: month labels, 30/60: show day/month
      format: rangeDays >= 300 ? "MMM" : "MMM d",
      textStyle: { color: "#5f6368", fontSize: compact ? 10 : 12 },
      gridlines: { color: "#e6e8eb", count: compact ? 4 : 8 },
      minorGridlines: { color: "transparent" },
      slantedText: true,
      slantedTextAngle: 35,
      showTextEvery: 1,
    },

    vAxis: {
      viewWindowMode: "explicit",
      viewWindow: { min: yDomain.min, max: yDomain.max },
      textStyle: { color: "#5f6368", fontSize: compact ? 10 : 12 },
      gridlines: { color: "#e6e8eb", count: compact ? 3 : 5 },
      minorGridlines: { color: "transparent" },
    },

    lineWidth: compact ? 2 : 3,
    pointSize: compact ? 0 : 2,
    tooltip: { textStyle: { fontSize: 12 } },
  };

  return (
    <Chart
      chartType="LineChart"
      width="100%"
      height={height}
      data={chartData}
      options={options}
    />
  );
}
