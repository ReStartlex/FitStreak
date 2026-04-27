"use client";

import { motion } from "framer-motion";
import { Plus, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { useI18n } from "@/lib/i18n/provider";
import { CURRENT_USER } from "@/lib/mock/user";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatNumber } from "@/lib/format";

export function TodayCard({
  todayEnergy,
  todayXp,
  todayKcal,
  goal: goalProp,
}: {
  todayEnergy: number;
  todayXp: number;
  todayKcal: number;
  goal?: number;
}) {
  const { t, locale } = useI18n();
  const goal = goalProp ?? CURRENT_USER.todayGoal;
  const pct = Math.min(100, Math.round((todayEnergy / goal) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface p-6 sm:p-8 relative overflow-hidden"
    >
      <div className="absolute -right-10 -top-10 size-72 rounded-full bg-lime/10 blur-3xl" />
      <div className="absolute -left-16 -bottom-20 size-72 rounded-full bg-violet/10 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-ink-dim text-sm">
            <Target className="size-4 text-lime" />
            <span className="uppercase tracking-widest text-xs text-ink-muted">
              {t.dashboard.todayTitle}
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-display-lg font-bold text-gradient-lime number-tabular leading-none">
              <AnimatedNumber value={todayEnergy} locale={locale} />
            </span>
            <span className="text-ink-dim text-base">
              / {formatNumber(goal, locale)} {t.scoring.energyShort}
            </span>
            <span className="text-ink-muted text-xs uppercase tracking-widest">
              {t.scoring.energyScore}
            </span>
          </div>
          <Progress value={todayEnergy} max={goal} tone="lime" size="lg" />
          <div className="text-sm text-ink-dim">
            {pct >= 100 ? t.dashboard.goalReached : t.dashboard.reminderHint}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat
            value={todayXp}
            label={t.scoring.xp}
            tone="violet"
            icon={<Zap className="size-3.5 text-violet-soft" />}
            locale={locale}
          />
          <Stat
            value={todayKcal}
            label={locale === "ru" ? "ккал" : "kcal"}
            tone="orange"
            locale={locale}
          />
          <Stat
            value={pct}
            label="%"
            isPct
            tone="lime"
            locale={locale}
          />
        </div>
      </div>

      <div className="absolute bottom-3 right-4 inline-flex items-center gap-1 text-xs text-ink-muted">
        <Plus className="size-3" />
        {locale === "ru" ? "обновляется в реальном времени" : "live updates"}
      </div>
    </motion.div>
  );
}

function Stat({
  value,
  label,
  isPct,
  tone,
  icon,
  locale,
}: {
  value: number;
  label: string;
  isPct?: boolean;
  tone: "lime" | "violet" | "orange";
  icon?: React.ReactNode;
  locale: "ru" | "en";
}) {
  const toneClass = {
    lime: "border-lime/30 bg-lime/[0.03]",
    violet: "border-violet/30 bg-violet/[0.03]",
    orange: "border-accent-orange/30 bg-accent-orange/[0.03]",
  }[tone];
  return (
    <div className={`rounded-xl border ${toneClass} p-4 flex flex-col items-start`}>
      <div className="flex items-center gap-1 text-xs text-ink-muted mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-2xl font-bold number-tabular">
        {formatNumber(value, locale)}
        {isPct ? "%" : ""}
      </div>
    </div>
  );
}
