"use client";

import { motion } from "framer-motion";
import { Trophy, Heart, Dumbbell, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { CURRENT_USER } from "@/lib/mock/user";
import { getExerciseName } from "@/lib/mock/exercises";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export interface PersonalStatsData {
  weekEnergy?: number;
  bestDayEnergy?: number;
  bestDayLabel?: string;
  favouriteExerciseId?: string;
  favouritePct?: number;
  totalEnergy?: number;
}

export function PersonalStats({ data }: { data?: PersonalStatsData } = {}) {
  const { t, locale } = useI18n();
  const d = data ?? {};

  const items = [
    {
      icon: BarChart3,
      label: t.dashboard.statsThisWeek,
      value: d.weekEnergy ?? 0,
      suffix: t.scoring.energyShort,
      tone: "lime" as const,
    },
    {
      icon: Trophy,
      label: t.dashboard.statsBestDay,
      value: d.bestDayEnergy ?? CURRENT_USER.bestDay.energy,
      suffix: t.scoring.energyShort,
      tone: "violet" as const,
      meta:
        d.bestDayLabel ??
        (locale === "ru"
          ? CURRENT_USER.bestDay.dateLabelRu
          : CURRENT_USER.bestDay.dateLabelEn),
    },
    {
      icon: Heart,
      label: t.dashboard.statsFavourite,
      valueText: getExerciseName(
        d.favouriteExerciseId ?? CURRENT_USER.favouriteExerciseId,
        locale,
      ),
      tone: "rose" as const,
      meta:
        d.favouritePct != null
          ? `${d.favouritePct}% ${locale === "ru" ? "активности" : "of activity"}`
          : locale === "ru"
            ? "по твоей активности"
            : "based on your activity",
    },
    {
      icon: Dumbbell,
      label: locale === "ru" ? "Всего ES" : "Lifetime ES",
      value: d.totalEnergy ?? 0,
      tone: "cyan" as const,
    },
  ];

  return (
    <div className="surface p-5 sm:p-6">
      <h3 className="font-display text-base font-semibold mb-4">
        {t.dashboard.statsTitle}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => {
          const Icon = it.icon;
          const toneCls = {
            lime: "border-lime/30 bg-lime/10 text-lime",
            violet: "border-violet/30 bg-violet/10 text-violet-soft",
            rose: "border-accent-rose/30 bg-accent-rose/10 text-accent-rose",
            cyan: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
          }[it.tone];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="rounded-2xl border border-line bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`size-7 grid place-items-center rounded-lg border ${toneCls}`}
                >
                  <Icon className="size-3.5" />
                </div>
                <span className="text-xs text-ink-muted uppercase tracking-widest">
                  {it.label}
                </span>
              </div>
              <div className="mt-2 font-display text-2xl font-bold number-tabular">
                {typeof it.value === "number" ? (
                  <>
                    <AnimatedNumber value={it.value} locale={locale} />
                    {it.suffix && (
                      <span className="text-sm text-ink-dim ml-1.5 font-sans font-normal">
                        {it.suffix}
                      </span>
                    )}
                  </>
                ) : (
                  it.valueText
                )}
              </div>
              {it.meta && (
                <div className="text-xs text-ink-muted mt-1">{it.meta}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
