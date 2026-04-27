"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { CURRENT_USER } from "@/lib/mock/user";
import { getLevelInfo } from "@/lib/leveling";
import {
  divisionName,
  getDivision,
  getTierTheme,
  nextDivision,
} from "@/lib/ranks";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

interface LevelCardProps {
  className?: string;
  totalXp?: number;
  /** XP earned today (used for the small recent XP badge). */
  todayXp?: number;
  /** Compact variant (for sidebar / smaller spaces). */
  compact?: boolean;
}

export function LevelCard({
  className,
  totalXp = CURRENT_USER.totalXp,
  todayXp = CURRENT_USER.todayXp,
  compact = false,
}: LevelCardProps) {
  const { t, locale } = useI18n();
  const info = getLevelInfo(totalXp);
  const division = getDivision(info.level);
  const theme = getTierTheme(division.tier);
  const next = nextDivision(info.level);
  const TierIcon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "surface relative overflow-hidden p-6 sm:p-7",
        theme.ringClass,
        className,
      )}
    >
      <div
        className={cn(
          "absolute -right-16 -top-16 size-72 rounded-full blur-3xl opacity-50 bg-gradient-to-br",
          theme.gradientClass,
        )}
      />
      <div className="absolute -left-20 -bottom-24 size-72 rounded-full bg-violet/10 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-ink-dim">
            <Zap className="size-4 text-lime" />
            <span className="text-xs uppercase tracking-widest text-ink-muted">
              {t.levels.title}
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white/[0.04]",
              theme.borderClass,
            )}
          >
            <TierIcon className={cn("size-4", theme.textClass)} />
            <span
              className={cn(
                "font-display text-xs font-semibold tracking-wide",
                theme.textClass,
              )}
            >
              {divisionName(division, locale)}
            </span>
          </div>
        </div>

        <div className="flex items-baseline flex-wrap gap-x-4 gap-y-1">
          <div className="font-display font-bold leading-none">
            <span className={cn("text-ink-muted text-2xl", compact && "text-xl")}>lv</span>
            <span
              className={cn(
                "text-gradient-lime ml-1 number-tabular",
                compact ? "text-5xl" : "text-display-lg",
              )}
            >
              {info.level}
            </span>
            <span className="text-ink-muted text-2xl ml-2">/100</span>
          </div>
          <span className="text-sm text-ink-dim">
            +{formatNumber(todayXp, locale)} {t.scoring.xp} {t.common.today.toLowerCase()}
          </span>
        </div>

        <div className="space-y-2">
          <div className="relative h-3 w-full overflow-hidden rounded-full border border-line bg-white/[0.04]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${info.progress}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full bg-lime-gradient shadow-[0_0_24px_rgba(198,255,61,0.6)]"
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 18px)",
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-ink-dim font-mono number-tabular">
            <span>
              {formatNumber(info.xpInLevel, locale)} / {formatNumber(info.xpForThisLevel, locale)} {t.scoring.xp}
            </span>
            <span>
              {info.isMax
                ? t.levels.maxLevelReached
                : `${formatNumber(info.xpToNext, locale)} ${t.levels.toNextLevel}`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl border border-line bg-white/[0.03] p-3">
            <div className="text-xs uppercase tracking-widest text-ink-muted mb-1">
              {t.levels.totalXp}
            </div>
            <div className="font-display text-xl font-bold number-tabular">
              {formatNumber(info.totalXp, locale)}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.03] p-3">
            <div className="text-xs uppercase tracking-widest text-ink-muted mb-1">
              {next ? t.levels.nextTier : t.levels.tier}
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const nextTheme = next ? getTierTheme(next.tier) : theme;
                const NextIcon = nextTheme.icon;
                return (
                  <>
                    <NextIcon className={cn("size-4", nextTheme.textClass)} />
                    <span
                      className={cn(
                        "font-display text-sm font-semibold",
                        nextTheme.textClass,
                      )}
                    >
                      {next ? divisionName(next, locale) : divisionName(division, locale)}
                    </span>
                    {next && (
                      <span className="ml-auto text-xs text-ink-muted">
                        {next.range[0] - info.level} {t.levels.levelsToTier.split(" ")[0]}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
