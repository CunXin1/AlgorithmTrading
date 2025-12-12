// ------------------------------------------------------------
// InvestorDonutChart.jsx
// ------------------------------------------------------------
// Donut chart with:
// - Local stock logos positioned EXACTLY by Recharts slice angles
// - External tooltip (not blocked by avatar)
// - Center investor avatar
// ------------------------------------------------------------

import { PieChart, Pie, Cell, Tooltip } from "recharts";

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

// ---------------- 核心：严格复刻 Recharts 的角度推进 ----------------
function computeLogoPositions(data, radius, maxLogos) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let currentAngle = 90; // Recharts 默认 startAngle
  const result = [];

  for (let i = 0; i < data.length && result.length < maxLogos; i++) {
    const d = data[i];
    const sliceAngle = (d.value / total) * 360;

    // 顺时针：角度递减
    const midAngle = currentAngle - sliceAngle / 2;
    const rad = (midAngle * Math.PI) / 180;

    result.push({
      ...d,
      x: Math.cos(rad) * radius,
      y: -Math.sin(rad) * radius, // ⚠️ SVG Y 轴向下，必须取负
    });

    currentAngle -= sliceAngle;
  }

  return result;
}

// ---------------- Main ----------------
export default function InvestorDonutChart({ data, avatar }) {
  // Buffett：8 → 前 4，其余：6
  const maxLogos = data.length > 6 ? 4 : data.length;

  const logos = computeLogoPositions(data, 76, maxLogos);

  return (
    <div className="donut-wrapper">
      <PieChart width={220} height={220}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={95}
          paddingAngle={2}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          content={<ExternalTooltip />}
          wrapperStyle={{ zIndex: 999 }}
        />
      </PieChart>

      {/* ⭐ 股票 logo：这次和扇区中心严格一致 */}
      {logos.map((item) => (
        <img
          key={item.name}
          src={item.logo}
          alt={item.name}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 30,
            height: 30,
            transform: `
              translate(-50%, -50%)
              translate(${item.x}px, ${item.y}px)
            `,
            borderRadius: "50%",
            background: "#fff",
            padding: "2px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* 中心头像 */}
      <img
        src={avatar}
        alt="avatar"
        className="donut-avatar"
      />
    </div>
  );
}
