"use client";

import { motion } from "framer-motion";
import { Activity, Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

const TYPE_THEME = {
  cardio: { color: "bg-lime-gradient", text: "text-lime", border: "border-lime/40", labelKey: "cardio" as const },
  strength: { color: "bg-violet-gradient", text: "text-violet-soft", border: "border-violet/40", labelKey: "strength" as const },
  core: { color: "bg-gradient-to-r from-accent-orange to-accent-rose", text: "text-accent-orange", border: "border-accent-orange/40", labelKey: "core" as const },
  static: { color: "bg-gradient-to-r from-accent-cyan to-violet", text: "text-accent-cyan", border: "border-accent-cyan/40", labelKey: "static" as const },
};

export interface AnalyticsData {
  todayKcal: number;
  weekKcal: number;
  weightKg: number | null;
  age: number | null;
  breakdown: {
    cardio: number;
    strength: number;
    core: number;
    static: number;
    cardioPct: number;
    strengthPct: number;
    corePct: number;
    staticPct: number;
  };
}

export function AnalyticsCard({ data }: { data: AnalyticsData }) {
  const { t, locale } = useI18n();
  const { todayKcal, weekKcal, breakdown, weightKg, age } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface p-6 relative overflow-hidden"
    >
      <div className="absolute -right-12 -top-12 size-72 rounded-full bg-accent-orange/12 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight flex items-center gap-2">
              <Flame className="size-4 text-accent-orange" />
              {t.profile.kcalTitle}
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">{t.profile.kcalSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <KcalStat label={t.profile.kcalToday} value={todayKcal} accent="orange" locale={locale} />
            <KcalStat label={t.profile.kcalWeek} value={weekKcal} accent="rose" locale={locale} />
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] p-3 text-xs text-ink-muted leading-relaxed">
            {locale === "ru"
              ? `Расчёт MET × вес × длительность. ${
                  weightKg && age
                    ? `Учитываются твои ${weightKg} кг и возраст ${age}.`
                    : "Заполни параметры тела, чтобы калории были точными."
                }`
              : `MET × weight × duration formula. ${
                  weightKg && age
                    ? `Uses your ${weightKg} kg and age ${age}.`
                    : "Fill in your body metrics for accurate kcal."
                }`}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight flex items-center gap-2">
              <Activity className="size-4 text-violet-soft" />
              {t.profile.breakdownTitle}
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">{t.profile.breakdownSubtitle}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full border border-line bg-white/[0.04]">
              <BarSegment pct={breakdown.cardioPct} kind="cardio" />
              <BarSegment pct={breakdown.strengthPct} kind="strength" />
              <BarSegment pct={breakdown.corePct} kind="core" />
              <BarSegment pct={breakdown.staticPct} kind="static" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Legend kind="cardio" pct={breakdown.cardioPct} energy={breakdown.cardio} t={t} />
              <Legend kind="strength" pct={breakdown.strengthPct} energy={breakdown.strength} t={t} />
              <Legend kind="core" pct={breakdown.corePct} energy={breakdown.core} t={t} />
              <Legend kind="static" pct={breakdown.staticPct} energy={breakdown.static} t={t} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KcalStat({
  label,
  value,
  accent,
  locale,
}: {
  label: string;
  value: number;
  accent: "orange" | "rose";
  locale: "ru" | "en";
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-white/[0.03] p-4",
      accent === "orange" ? "border-accent-orange/30" : "border-accent-rose/30",
    )}>
      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">
        {label}
      </div>
      <div className="font-display text-2xl font-bold number-tabular">
        {formatNumber(value, locale)}
        <span className="text-ink-muted text-sm ml-1">{locale === "ru" ? "ккал" : "kcal"}</span>
      </div>
    </div>
  );
}

function BarSegment({
  pct,
  kind,
}: {
  pct: number;
  kind: keyof typeof TYPE_THEME;
}) {
  const theme = TYPE_THEME[kind];
  return (
    <div
      className={cn("h-full transition-all duration-700", theme.color)}
      style={{ width: `${pct}%` }}
    />
  );
}

function Legend({
  kind,
  pct,
  energy,
  t,
}: {
  kind: keyof typeof TYPE_THEME;
  pct: number;
  energy: number;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const theme = TYPE_THEME[kind];
  return (
    <div className={cn("rounded-xl border bg-white/[0.02] p-3", theme.border)}>
      <div className={cn("text-xs font-medium", theme.text)}>
        {t.scoring[theme.labelKey]}
      </div>
      <div className="font-display text-lg font-bold number-tabular mt-0.5">
        {pct}%
      </div>
      <div className="text-[10px] text-ink-muted mt-0.5">
        {Math.round(energy)} ES
      </div>
    </div>
  );
}
