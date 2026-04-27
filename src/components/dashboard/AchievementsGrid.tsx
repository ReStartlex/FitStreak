"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

interface ApiItem {
  slug: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  icon: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "ELITE" | "LEGEND";
  rewardXp: number;
  unlocked: boolean;
  count: number;
  unlockedAt: string | null;
  lastEarnedAt: string | null;
}

const TIER_TONE: Record<ApiItem["tier"], string> = {
  BRONZE: "border-amber-700/40",
  SILVER: "border-slate-300/30",
  GOLD: "border-accent-orange/50",
  ELITE: "border-violet/50",
  LEGEND: "border-lime/60 shadow-glow",
};

export function AchievementsGrid({ limit }: { limit?: number }) {
  const { t, locale } = useI18n();
  const [items, setItems] = React.useState<ApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/me/achievements")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (cancelled) return;
        setItems(json?.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = limit ? items.slice(0, limit) : items;
  const unlockedCount = items.filter((a) => a.unlocked).length;

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold">
            {t.dashboard.achievementsTitle}
          </h3>
          <p className="text-xs text-ink-dim">
            {t.dashboard.achievementsSubtitle}
          </p>
        </div>
        {!loading && items.length > 0 && (
          <span className="text-xs text-ink-muted number-tabular">
            {unlockedCount}/{items.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center py-10 text-ink-muted">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-sm text-ink-dim py-6">
          {t.achievements.empty}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((a, i) => (
            <motion.div
              key={a.slug}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className={cn(
                "relative rounded-2xl border bg-white/[0.02] p-3 flex flex-col items-center text-center gap-1.5 transition-colors",
                TIER_TONE[a.tier],
                !a.unlocked && "opacity-55",
              )}
              title={
                a.unlocked
                  ? `+${a.rewardXp} XP · earned ×${a.count}`
                  : `+${a.rewardXp} XP — locked`
              }
            >
              {!a.unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="size-3 text-ink-muted" />
                </div>
              )}
              {a.unlocked && a.count > 1 && (
                <div className="absolute top-2 right-2 text-[10px] font-bold px-1.5 h-5 rounded-full bg-lime/20 text-lime border border-lime/40 number-tabular">
                  ×{a.count}
                </div>
              )}
              <div className="text-3xl">{a.icon}</div>
              <div className="text-xs font-medium leading-tight">
                {locale === "ru" ? a.titleRu : a.titleEn}
              </div>
              <div className="text-[10px] text-ink-muted leading-snug">
                {locale === "ru" ? a.descRu : a.descEn}
              </div>
              <div className="text-[10px] text-lime/80 mt-0.5">
                +{a.rewardXp} XP
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
