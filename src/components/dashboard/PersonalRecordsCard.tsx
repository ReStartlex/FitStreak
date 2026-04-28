"use client";

import * as React from "react";
import { Trophy, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/provider";
import { EXERCISES, exerciseUnitLabel } from "@/lib/mock/exercises";
import { formatNumber } from "@/lib/format";

interface ExRec {
  exerciseId: string;
  totalAmount: number;
  totalEnergy: number;
  recordsCount: number;
  bestSingleEntry: number;
  bestDayAmount: number;
  bestDayDate: string | null;
}

interface RecordsResp {
  bestEnergyDay: { date: string; energy: number } | null;
  exercises: ExRec[];
}

/**
 * Personal records dashboard card. Shows the user's best Energy day +
 * top 3 exercise PRs (best single entry / best calendar day total).
 */
export function PersonalRecordsCard() {
  const { locale } = useI18n();
  const [data, setData] = React.useState<RecordsResp | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/me/records", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setData({ bestEnergyDay: null, exercises: [] });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="surface p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-4 text-accent-orange" />
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Личные рекорды" : "Personal records"}
          </h3>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-white/[0.03] border border-line animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const top = data.exercises.slice(0, 3);
  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(
      locale === "ru" ? "ru-RU" : "en-US",
      { day: "numeric", month: "short" },
    );
  };

  if (top.length === 0 && !data.bestEnergyDay) {
    return (
      <div className="surface p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-4 text-accent-orange" />
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Личные рекорды" : "Personal records"}
          </h3>
        </div>
        <div className="text-sm text-ink-muted">
          {locale === "ru"
            ? "Запиши пару подходов — здесь появятся твои PR."
            : "Log a few sets — your PRs will show up here."}
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-accent-orange" />
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Личные рекорды" : "Personal records"}
          </h3>
        </div>
        {data.bestEnergyDay && (
          <span className="text-[11px] text-ink-muted inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {locale === "ru" ? "лучший день" : "best day"}{" "}
            <span className="text-lime number-tabular">
              {formatNumber(data.bestEnergyDay.energy, locale)} ES
            </span>
          </span>
        )}
      </div>

      <ul className="grid gap-2">
        {top.map((r, i) => {
          const ex = EXERCISES.find((e) => e.id === r.exerciseId);
          const Icon = ex?.icon;
          const tone = ex?.tone ?? "lime";
          const unit = ex ? exerciseUnitLabel(ex, locale) : "";
          const exName = ex
            ? locale === "ru"
              ? ex.nameRu
              : ex.nameEn
            : r.exerciseId;
          const toneClass: Record<string, string> = {
            lime: "border-lime/30 text-lime bg-lime/10",
            violet: "border-violet/30 text-violet-soft bg-violet/10",
            rose: "border-accent-rose/30 text-accent-rose bg-accent-rose/10",
            cyan: "border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10",
            orange:
              "border-accent-orange/30 text-accent-orange bg-accent-orange/10",
          };
          return (
            <motion.li
              key={r.exerciseId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3"
            >
              <div
                className={`size-9 grid place-items-center rounded-xl border ${toneClass[tone]}`}
              >
                {Icon && <Icon className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{exName}</div>
                <div className="text-[11px] text-ink-muted">
                  {locale === "ru" ? "лучший день" : "best day"}{" "}
                  <span className="text-ink-dim number-tabular">
                    {formatNumber(r.bestDayAmount, locale)} {unit}
                  </span>
                  <span className="opacity-70">
                    {" "}
                    · {fmtDate(r.bestDayDate)}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-display text-base font-bold text-ink number-tabular">
                  {formatNumber(r.bestSingleEntry, locale)}
                </div>
                <div className="text-[10px] text-ink-muted">
                  {locale === "ru" ? "макс. за раз" : "single PR"}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
