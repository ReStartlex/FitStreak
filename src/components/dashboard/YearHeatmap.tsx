"use client";

import * as React from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

const LEVEL_BG: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-white/[0.04] border-line/40",
  1: "bg-lime/20 border-lime/20",
  2: "bg-lime/45 border-lime/30",
  3: "bg-lime/70 border-lime/40",
  4: "bg-lime border-lime/60 shadow-glow",
};

interface YearHeatmapProps {
  /** ISO date (YYYY-MM-DD) → daily energy (or any non-negative number). */
  data: Record<string, number>;
  /** Anchor; defaults to today. The grid covers the 365 days ending on it. */
  endDate?: Date;
  className?: string;
}

interface YearCell {
  date: Date;
  iso: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * Calendar-year heatmap (≈53 columns × 7 rows) inspired by GitHub's
 * contribution graph but tuned for energy. Computes levels from the
 * provided dataset's actual maximum so a quiet user still sees colour.
 *
 * Pure presentational component — no data fetching here.
 */
export function YearHeatmap({ data, endDate, className }: YearHeatmapProps) {
  const { locale } = useI18n();
  const end = React.useMemo(() => {
    const d = endDate ? new Date(endDate) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [endDate]);

  // Anchor to the Sunday-or-Monday before `end` so the columns line up.
  // We use Monday-first to match the rest of the app.
  const grid = React.useMemo(() => {
    const start = new Date(end);
    start.setDate(start.getDate() - 364); // 52 weeks + 1 day = 365
    // Roll back to Monday so each column is a full week.
    const dayOfWeek = start.getDay() === 0 ? 7 : start.getDay();
    start.setDate(start.getDate() - (dayOfWeek - 1));

    let max = 0;
    for (const v of Object.values(data)) max = Math.max(max, v);

    const cells: YearCell[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      const value = data[iso] ?? 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (value > 0 && max > 0) {
        const ratio = value / max;
        if (ratio > 0.75) level = 4;
        else if (ratio > 0.5) level = 3;
        else if (ratio > 0.25) level = 2;
        else level = 1;
      }
      cells.push({ date: new Date(cursor), iso, value, level });
      cursor.setDate(cursor.getDate() + 1);
    }
    // Slice into 7-row columns.
    const columns: YearCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      columns.push(cells.slice(i, i + 7));
    }
    return { columns, max, totalActive: cells.filter((c) => c.value > 0).length };
  }, [data, end]);

  const monthLabels =
    locale === "ru"
      ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayLabels =
    locale === "ru" ? ["Пн", "Ср", "Пт"] : ["Mon", "Wed", "Fri"];

  // For the header row of month labels: use the column where a new
  // month appears (col[0].date day=1..7). Skip the first label if it
  // immediately falls in the first column.
  const monthHeader = grid.columns.map((col, idx) => {
    if (idx === 0) return null;
    const first = col[0];
    if (!first) return null;
    if (first.date.getDate() <= 7) return monthLabels[first.date.getMonth()];
    return null;
  });

  const totalDays = grid.columns.flat().filter((c) => c.iso <= end.toISOString().slice(0, 10)).length;
  const activePct = totalDays > 0 ? Math.round((grid.totalActive / totalDays) * 100) : 0;

  return (
    <div className={cn("surface p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Год активности" : "Year of activity"}
          </h3>
          <p className="text-xs text-ink-dim">
            {locale === "ru"
              ? `${formatNumber(grid.totalActive, locale)} активных дней · ${activePct}% от года`
              : `${formatNumber(grid.totalActive, locale)} active days · ${activePct}% of the year`}
          </p>
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
        <div className="flex gap-[3px] px-1 min-w-max">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[3px] mr-1 pt-3.5">
            <span className="size-2.5 text-[10px] text-ink-muted leading-3">
              {dayLabels[0]}
            </span>
            <span className="size-2.5" />
            <span className="size-2.5 text-[10px] text-ink-muted leading-3">
              {dayLabels[1]}
            </span>
            <span className="size-2.5" />
            <span className="size-2.5 text-[10px] text-ink-muted leading-3">
              {dayLabels[2]}
            </span>
            <span className="size-2.5" />
            <span className="size-2.5" />
          </div>
          {grid.columns.map((col, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              <div className="text-[10px] text-ink-muted h-3 leading-3">
                {monthHeader[w] ?? ""}
              </div>
              {Array.from({ length: 7 }).map((_, i) => {
                const c = col[i];
                if (!c) {
                  return (
                    <span
                      key={`${w}-${i}-empty`}
                      className="size-2.5 sm:size-3 rounded-[3px] opacity-0"
                    />
                  );
                }
                // Hide future cells inside the trailing week.
                if (c.iso > end.toISOString().slice(0, 10)) {
                  return (
                    <span
                      key={`${w}-${i}-future`}
                      className="size-2.5 sm:size-3 rounded-[3px] opacity-0"
                    />
                  );
                }
                return (
                  <span
                    key={`${w}-${i}`}
                    className={`size-2.5 sm:size-3 rounded-[3px] border ${LEVEL_BG[c.level]}`}
                    title={`${c.iso} · ${formatNumber(c.value, locale)}${c.value > 0 ? " ⚡" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
