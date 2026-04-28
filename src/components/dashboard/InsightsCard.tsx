"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  Flame,
  Target,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

interface ApiInsight {
  kind:
    | "WEEK_TREND"
    | "BEST_DAY"
    | "STREAK_RISK"
    | "STREAK_PUSH"
    | "GOAL_PACE"
    | "EXERCISE_FAVORITE"
    | "REST_DAY"
    | "MOMENTUM"
    | "WELCOME";
  tone: "good" | "info" | "warn";
  ru: string;
  en: string;
  subRu?: string;
  subEn?: string;
}

const ICONS: Record<ApiInsight["kind"], React.ComponentType<{ className?: string }>> = {
  WEEK_TREND: TrendingUp,
  BEST_DAY: Trophy,
  STREAK_RISK: AlertTriangle,
  STREAK_PUSH: Flame,
  GOAL_PACE: Target,
  EXERCISE_FAVORITE: Lightbulb,
  REST_DAY: Sparkles,
  MOMENTUM: Flame,
  WELCOME: Sparkles,
};

const TONE: Record<
  ApiInsight["tone"],
  { ring: string; iconCls: string; bg: string }
> = {
  good: {
    ring: "border-lime/30",
    iconCls: "text-lime",
    bg: "bg-gradient-to-br from-lime/[0.08] to-transparent",
  },
  info: {
    ring: "border-violet/30",
    iconCls: "text-violet-soft",
    bg: "bg-gradient-to-br from-violet/[0.08] to-transparent",
  },
  warn: {
    ring: "border-accent-orange/40",
    iconCls: "text-accent-orange",
    bg: "bg-gradient-to-br from-accent-orange/[0.10] to-transparent",
  },
};

/**
 * Tiny on-dashboard card with 1–3 personalised insights pulled from
 * `/api/me/insights`. Updates lazily — the endpoint is cheap but
 * we don't want to refetch on every interaction.
 */
export function InsightsCard() {
  const { locale } = useI18n();
  const [items, setItems] = React.useState<ApiInsight[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/me/insights")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!cancelled) setItems(j?.insights ?? []);
      })
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (items && items.length === 0) return null;

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-violet-soft" />
        <h3 className="font-display text-base font-semibold">
          {locale === "ru" ? "Подсказки" : "Insights"}
        </h3>
      </div>
      {!items ? (
        <div className="grid place-items-center py-6 text-ink-muted">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((it, i) => {
              const Icon = ICONS[it.kind];
              const tone = TONE[it.tone];
              const ToneIcon =
                it.kind === "WEEK_TREND" && it.tone === "warn"
                  ? TrendingDown
                  : Icon;
              return (
                <motion.div
                  key={`${it.kind}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className={cn(
                    "rounded-xl border p-3 flex items-start gap-3",
                    tone.ring,
                    tone.bg,
                  )}
                >
                  <div
                    className={cn(
                      "size-8 grid place-items-center rounded-lg border border-line bg-bg-card/60 shrink-0",
                      tone.iconCls,
                    )}
                  >
                    <ToneIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-snug">
                      {locale === "ru" ? it.ru : it.en}
                    </div>
                    {(locale === "ru" ? it.subRu : it.subEn) && (
                      <div className="text-xs text-ink-muted mt-0.5 number-tabular">
                        {locale === "ru" ? it.subRu : it.subEn}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
