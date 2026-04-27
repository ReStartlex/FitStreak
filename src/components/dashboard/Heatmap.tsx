"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/provider";
import { buildHeatmap } from "@/lib/mock/activity";

const LEVEL_BG: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-white/[0.04] border-line/40",
  1: "bg-lime/20 border-lime/20",
  2: "bg-lime/45 border-lime/30",
  3: "bg-lime/70 border-lime/40",
  4: "bg-lime border-lime/60 shadow-glow",
};

interface HeatmapCell {
  level: 0 | 1 | 2 | 3 | 4;
}

function buildFromData(weeks: number, data: Record<string, number>): HeatmapCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = weeks * 7;
  const start = new Date(today);
  start.setDate(start.getDate() - (totalDays - 1));

  const cells: HeatmapCell[] = [];
  let max = 0;
  for (const v of Object.values(data)) max = Math.max(max, v);

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const v = data[key] ?? 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (v > 0 && max > 0) {
      const ratio = v / max;
      if (ratio > 0.75) level = 4;
      else if (ratio > 0.5) level = 3;
      else if (ratio > 0.25) level = 2;
      else level = 1;
    }
    cells.push({ level });
  }
  return cells;
}

export function Heatmap({
  weeks = 12,
  data,
}: {
  weeks?: number;
  data?: Record<string, number>;
}) {
  const { t, locale } = useI18n();
  const cells = data ? buildFromData(weeks, data) : buildHeatmap(weeks);

  const columns: HeatmapCell[][] = Array.from({ length: weeks }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7),
  );

  const monthLabels =
    locale === "ru"
      ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold">
            {t.dashboard.heatmapTitle}
          </h3>
          <p className="text-xs text-ink-dim">{t.dashboard.heatmapSubtitle}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-ink-muted">
          <span>{locale === "ru" ? "меньше" : "less"}</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className={`size-3 rounded-[3px] border ${LEVEL_BG[l as 0 | 1 | 2 | 3 | 4]}`}
            />
          ))}
          <span>{locale === "ru" ? "больше" : "more"}</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <div className="flex gap-1 px-1 min-w-max">
          {columns.map((col, w) => (
            <div key={w} className="flex flex-col gap-1">
              <div className="text-[10px] text-ink-muted h-3">
                {w % 4 === 0 ? monthLabels[(w / 4) % 12] : ""}
              </div>
              {col.map((c, i) => (
                <motion.div
                  key={`${w}-${i}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: (w * 7 + i) * 0.003 }}
                  className={`size-3.5 sm:size-4 rounded-[4px] border ${LEVEL_BG[c.level]}`}
                  title={`Level ${c.level}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
