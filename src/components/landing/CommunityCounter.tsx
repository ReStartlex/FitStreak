"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/provider";
import { EXERCISES } from "@/lib/mock/exercises";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Section } from "@/components/ui/Section";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useCommunityStats } from "@/lib/hooks/use-community-stats";

export function CommunityCounter() {
  const { t, locale } = useI18n();
  const { data: stats, loading } = useCommunityStats();

  // Show every exercise tracked in the product (so cards aren't empty
  // before the first activity log of the day) but seed with real data
  // when the API has counted something.
  const cards = React.useMemo(() => {
    const real = new Map<
      string,
      { amount: number; deltaPct: number }
    >();
    for (const row of stats?.today.perExercise ?? []) {
      real.set(row.exerciseId, {
        amount: row.amount,
        deltaPct: row.deltaPct,
      });
    }
    return EXERCISES.filter((e) => e.id !== "active-time").map((ex) => {
      const r = real.get(ex.id);
      return {
        exercise: ex,
        amount: r?.amount ?? 0,
        deltaPct: r?.deltaPct ?? 0,
      };
    });
  }, [stats]);

  const totalToday = stats?.today.totalAmount ?? 0;
  const myToday = stats?.me?.todayAmount ?? 0;

  return (
    <Section
      eyebrow={t.common.live}
      title={t.landing.communityTitle}
      subtitle={t.landing.communitySubtitle}
      align="center"
    >
      <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        {cards.map(({ exercise, amount, deltaPct }, idx) => {
          const Icon = exercise.icon;
          const isPositive = deltaPct >= 0;
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.04 }}
              className="relative surface p-4 sm:p-6 overflow-hidden group"
            >
              <div className="absolute -right-6 -top-6 size-32 rounded-full bg-lime/8 blur-2xl group-hover:bg-lime/12 transition-colors" />
              <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="grid place-items-center size-9 sm:size-10 rounded-xl border border-line bg-white/[0.04]">
                    <Icon className="size-4 sm:size-5 text-lime" />
                  </div>
                  {amount > 0 && (
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        isPositive ? "text-success" : "text-ink-muted"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="size-3.5" />
                      ) : (
                        <TrendingDown className="size-3.5" />
                      )}
                      {isPositive ? "+" : ""}
                      {deltaPct}%
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight number-tabular">
                    {loading && amount === 0 ? (
                      <span className="text-ink-muted">—</span>
                    ) : (
                      <AnimatedNumber value={amount} locale={locale} />
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-ink-dim mt-1">
                    {locale === "ru" ? exercise.nameRu : exercise.nameEn}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 sm:mt-8 surface p-5 sm:p-8 grid gap-5 sm:grid-cols-[1fr_auto] items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
            {t.landing.communityTitle}
          </div>
          <div className="font-display text-display-md text-gradient-lime number-tabular">
            <AnimatedNumber value={totalToday} locale={locale} />
          </div>
          {totalToday === 0 && !loading && (
            <p className="text-sm text-ink-muted mt-2">
              {locale === "ru"
                ? "Сегодня ещё никто не отметил активность — стань первым."
                : "No activity logged today yet — be the first."}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 sm:border-l sm:border-line sm:pl-8">
          <div className="size-10 grid place-items-center rounded-xl bg-lime-gradient text-bg shadow-glow">
            <TrendingUp className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-ink-muted uppercase tracking-widest">
              {t.landing.communityYouContrib}
            </span>
            <span className="text-lg font-semibold number-tabular">
              <AnimatedNumber value={myToday} locale={locale} />{" "}
              <span className="text-ink-dim text-sm">{t.common.reps}</span>
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}
