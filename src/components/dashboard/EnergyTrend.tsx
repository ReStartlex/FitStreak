"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface Props {
  data: Record<string, number>;
  goal: number;
  days?: number;
}

/**
 * Compact 30-day energy trend with an SVG line + area gradient + goal
 * dashed line. No chart lib dependency — keeps bundle tiny.
 */
export function EnergyTrend({ data, goal, days = 30 }: Props) {
  const { locale } = useI18n();
  const series = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: { date: Date; value: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: d, value: data[key] ?? 0 });
    }
    return out;
  }, [data, days]);

  const max = Math.max(goal, ...series.map((p) => p.value), 1);
  const total = series.reduce((a, b) => a + b.value, 0);
  const avg = Math.round(total / Math.max(1, series.length));
  const recent7 = series
    .slice(-7)
    .reduce((a, b) => a + b.value, 0);
  const prev7 = series
    .slice(-14, -7)
    .reduce((a, b) => a + b.value, 0);
  const delta =
    prev7 > 0 ? Math.round(((recent7 - prev7) / prev7) * 100) : recent7 > 0 ? 100 : 0;

  // SVG geometry
  const W = 600;
  const H = 140;
  const PAD_T = 16;
  const PAD_B = 22;
  const PAD_X = 8;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_T - PAD_B;
  const stepX = series.length > 1 ? innerW / (series.length - 1) : innerW;

  const points = series.map((p, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_T + innerH - (p.value / max) * innerH,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L${(PAD_X + (points.length - 1) * stepX).toFixed(1)},${(PAD_T + innerH).toFixed(1)} L${PAD_X.toFixed(1)},${(PAD_T + innerH).toFixed(1)} Z`;

  const goalY = PAD_T + innerH - (Math.min(goal, max) / max) * innerH;

  // Tick labels for first/mid/last day
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
    });

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-lime" />
            <h3 className="font-display text-base font-semibold">
              {locale === "ru" ? "Energy за 30 дней" : "30-day energy"}
            </h3>
          </div>
          <p className="text-xs text-ink-dim mt-0.5">
            {locale === "ru" ? "Среднее: " : "Avg: "}
            <span className="text-ink number-tabular">{avg}</span> ES/
            {locale === "ru" ? "д" : "d"} ·{" "}
            {locale === "ru" ? "Всего: " : "Total: "}
            <span className="text-ink number-tabular">{total}</span> ES
          </p>
        </div>
        <span
          className={`text-xs font-display font-semibold rounded-full px-2 py-1 border ${
            delta > 0
              ? "border-lime/40 bg-lime/10 text-lime"
              : delta < 0
                ? "border-accent-rose/40 bg-accent-rose/10 text-accent-rose"
                : "border-line bg-white/[0.04] text-ink-dim"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta}%
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Energy trend"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c6ff3d" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c6ff3d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Goal dashed line */}
        {goal > 0 && goal <= max && (
          <line
            x1={PAD_X}
            x2={W - PAD_X}
            y1={goalY}
            y2={goalY}
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="4 4"
          />
        )}
        {/* Area + line */}
        <motion.path
          d={areaD}
          fill="url(#trend-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke="#c6ff3d"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />
        {/* Today marker */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={4}
            fill="#c6ff3d"
            stroke="#0A0A0B"
            strokeWidth={1.5}
          />
        )}
        {/* X axis labels */}
        <text
          x={PAD_X}
          y={H - 6}
          fill="rgba(255,255,255,0.4)"
          fontSize="10"
        >
          {fmt(series[0].date)}
        </text>
        <text
          x={W / 2}
          y={H - 6}
          fill="rgba(255,255,255,0.4)"
          fontSize="10"
          textAnchor="middle"
        >
          {fmt(series[Math.floor(series.length / 2)].date)}
        </text>
        <text
          x={W - PAD_X}
          y={H - 6}
          fill="rgba(255,255,255,0.4)"
          fontSize="10"
          textAnchor="end"
        >
          {locale === "ru" ? "сегодня" : "today"}
        </text>
      </svg>
    </div>
  );
}
