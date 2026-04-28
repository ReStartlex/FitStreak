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

const TIER_LABEL: Record<
  ApiItem["tier"],
  { ru: string; en: string; chip: string }
> = {
  BRONZE: { ru: "Бронза", en: "Bronze", chip: "text-amber-400" },
  SILVER: { ru: "Серебро", en: "Silver", chip: "text-slate-300" },
  GOLD: { ru: "Золото", en: "Gold", chip: "text-accent-orange" },
  ELITE: { ru: "Элита", en: "Elite", chip: "text-violet-soft" },
  LEGEND: { ru: "Легенда", en: "Legend", chip: "text-lime" },
};

const TIER_ORDER: ApiItem["tier"][] = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "ELITE",
  "LEGEND",
];

type StatusFilter = "all" | "unlocked" | "locked";

interface AchievementsGridProps {
  /** Limit visible items (used for compact dashboard view). */
  limit?: number;
  /** Whether to render the filter toolbar (tier chips + status). */
  showFilters?: boolean;
}

export function AchievementsGrid({
  limit,
  showFilters = false,
}: AchievementsGridProps) {
  const { t, locale } = useI18n();
  const [items, setItems] = React.useState<ApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tier, setTier] = React.useState<ApiItem["tier"] | "ALL">("ALL");
  const [status, setStatus] = React.useState<StatusFilter>("all");

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

  // Per-tier counts so each chip can show how many are unlocked.
  const tierCounts = React.useMemo(() => {
    const map: Record<string, { total: number; unlocked: number }> = {};
    for (const a of items) {
      const slot = (map[a.tier] ??= { total: 0, unlocked: 0 });
      slot.total += 1;
      if (a.unlocked) slot.unlocked += 1;
    }
    return map;
  }, [items]);

  const filtered = React.useMemo(() => {
    let list = items;
    if (tier !== "ALL") list = list.filter((a) => a.tier === tier);
    if (status === "unlocked") list = list.filter((a) => a.unlocked);
    if (status === "locked") list = list.filter((a) => !a.unlocked);
    return list;
  }, [items, tier, status]);

  const visible = limit ? filtered.slice(0, limit) : filtered;
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

      {showFilters && !loading && items.length > 0 && (
        <div className="mb-4 flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={tier === "ALL"}
              onClick={() => setTier("ALL")}
            >
              {locale === "ru" ? "Все" : "All"}{" "}
              <span className="text-ink-muted">({items.length})</span>
            </FilterChip>
            {TIER_ORDER.map((tk) => {
              const count = tierCounts[tk];
              if (!count) return null;
              const label = TIER_LABEL[tk];
              return (
                <FilterChip
                  key={tk}
                  active={tier === tk}
                  onClick={() => setTier(tk)}
                  className={tier === tk ? "" : label.chip}
                >
                  {locale === "ru" ? label.ru : label.en}{" "}
                  <span className="text-ink-muted">
                    {count.unlocked}/{count.total}
                  </span>
                </FilterChip>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={status === "all"}
              onClick={() => setStatus("all")}
              tone="ghost"
            >
              {locale === "ru" ? "Все" : "All"}
            </FilterChip>
            <FilterChip
              active={status === "unlocked"}
              onClick={() => setStatus("unlocked")}
              tone="ghost"
            >
              {locale === "ru" ? "Открыто" : "Unlocked"}
            </FilterChip>
            <FilterChip
              active={status === "locked"}
              onClick={() => setStatus("locked")}
              tone="ghost"
            >
              {locale === "ru" ? "Закрыто" : "Locked"}
            </FilterChip>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-10 text-ink-muted">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-sm text-ink-dim py-6">
          {t.achievements.empty}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center text-sm text-ink-dim py-6">
          {locale === "ru"
            ? "По выбранным фильтрам ничего нет."
            : "Nothing matches the current filters."}
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

function FilterChip({
  active,
  onClick,
  children,
  className,
  tone = "solid",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  tone?: "solid" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-full text-xs font-medium transition-colors border",
        active
          ? tone === "ghost"
            ? "bg-white/[0.08] border-white/15 text-ink"
            : "bg-lime/15 border-lime/40 text-lime"
          : "bg-white/[0.02] border-line text-ink-dim hover:text-ink hover:bg-white/[0.05]",
        className,
      )}
    >
      {children}
    </button>
  );
}
