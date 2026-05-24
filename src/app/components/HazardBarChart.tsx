import { useState } from "react";

const HAZARD_CATEGORY_DATA = [
  { category: "Electrical", Low: 4, Medium: 6, High: 5 },
  { category: "Mechanical", Low: 8, Medium: 5, High: 3 },
  { category: "Heights",    Low: 2, Medium: 7, High: 8 },
  { category: "Chemical",   Low: 5, Medium: 4, High: 2 },
  { category: "Confined",   Low: 1, Medium: 3, High: 5 },
];

export function HazardBarChart() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const W = 480, H = 100;
  const padL = 28, padR = 12, padT = 6, padB = 18;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...HAZARD_CATEGORY_DATA.map((d) => d.Low + d.Medium + d.High));
  const yMax = Math.ceil(maxVal / 5) * 5;
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map(Math.round);

  const n = HAZARD_CATEGORY_DATA.length;
  const barW = Math.min(28, (chartW / n) * 0.45);
  const slotW = chartW / n;

  const toY = (v: number) => padT + chartH - (v / yMax) * chartH;

  const COLORS = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 md:px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>Hazards by Category</h3>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block" style={{ fontFamily: "DM Mono, monospace" }}>Risk level breakdown · May 2026</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {(["Low", "Medium", "High"] as const).map((label) => (
            <span key={label} className="flex items-center gap-1 md:gap-1.5 text-muted-foreground font-medium" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}>
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[label] }} />
              <span className="hidden sm:inline">{label}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="px-2 md:px-4 pt-4 pb-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block", overflow: "visible" }}
          onMouseLeave={() => setHoveredBar(null)}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={padL} y1={toY(t)} x2={W - padR} y2={toY(t)} stroke="rgba(26,53,88,0.07)" strokeWidth={1} strokeDasharray="3 3" />
              <text x={padL - 5} y={toY(t) + 3} textAnchor="end" fill="#5a6880" style={{ fontFamily: "DM Mono, monospace", fontSize: 9 }}>{t}</text>
            </g>
          ))}

          {HAZARD_CATEGORY_DATA.map((d, i) => {
            const cx = padL + slotW * i + slotW / 2;
            const x = cx - barW / 2;
            const isHovered = hoveredBar === i;

            const segments: { key: string; color: string; value: number }[] = [
              { key: "Low",    color: COLORS.Low,    value: d.Low    },
              { key: "Medium", color: COLORS.Medium, value: d.Medium },
              { key: "High",   color: COLORS.High,   value: d.High   },
            ];
            const total = d.Low + d.Medium + d.High;
            let accumulated = 0;

            return (
              <g key={i} onMouseEnter={() => setHoveredBar(i)} style={{ cursor: "default" }}>
                {isHovered && (
                  <rect x={cx - slotW * 0.4} y={padT} width={slotW * 0.8} height={chartH} fill="rgba(26,53,88,0.04)" rx={3} />
                )}

                {segments.map(({ key, color, value }) => {
                  const segH = (value / yMax) * chartH;
                  const y = toY(accumulated + value);
                  accumulated += value;
                  const isTop = key === "High";
                  return (
                    <rect key={key} x={x} y={y} width={barW} height={segH} fill={color} rx={isTop ? 3 : 0} ry={isTop ? 3 : 0} opacity={isHovered ? 1 : 0.85} />
                  );
                })}

                <text x={cx} y={H - 6} textAnchor="middle" fill="#5a6880" style={{ fontFamily: "DM Mono, monospace", fontSize: 9 }}>{d.category}</text>

                {isHovered && (() => {
                  const tipW = 110, tipH = 66, tipPad = 8;
                  let tx = cx - tipW / 2;
                  if (tx < 0) tx = 0;
                  if (tx + tipW > W) tx = W - tipW;
                  const rawTy = toY(total) - tipH - 8;
                  const ty = rawTy < 0 ? toY(total) + 4 : rawTy;
                  return (
                    <g>
                      <rect x={tx} y={ty} width={tipW} height={tipH} rx={6} fill="white" stroke="rgba(26,53,88,0.12)" strokeWidth={1} filter="drop-shadow(0 2px 6px rgba(0,0,0,0.08))" />
                      <text x={tx + tipPad} y={ty + 14} fill="#0f1e33" style={{ fontFamily: "Roboto Slab, serif", fontSize: 10, fontWeight: 600 }}>{d.category}</text>
                      {(["High", "Medium", "Low"] as const).map((k, ri) => (
                        <g key={k}>
                          <rect x={tx + tipPad} y={ty + 22 + ri * 14} width={7} height={7} rx={1} fill={COLORS[k]} />
                          <text x={tx + tipPad + 11} y={ty + 29 + ri * 14} fill="#5a6880" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9 }}>{k}</text>
                          <text x={tx + tipW - tipPad} y={ty + 29 + ri * 14} textAnchor="end" fill="#0f1e33" style={{ fontFamily: "DM Mono, monospace", fontSize: 9, fontWeight: 700 }}>{d[k]}</text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
