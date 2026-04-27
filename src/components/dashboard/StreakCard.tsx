"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { CURRENT_USER } from "@/lib/mock/user";
import { Button } from "@/components/ui/Button";

export function StreakCard({
  current,
  best,
}: {
  current?: number;
  best?: number;
} = {}) {
  const { t, locale } = useI18n();
  const days = current ?? CURRENT_USER.streak;
  const bestStreak = best ?? CURRENT_USER.bestStreak;
  const dotsToShow = Math.min(days, 28);

  return (
    <div className="surface p-6 relative overflow-hidden">
      <div className="absolute -right-12 -top-12 size-72 rounded-full bg-accent-orange/15 blur-3xl" />
      <div className="absolute -left-12 -bottom-12 size-72 rounded-full bg-accent-rose/12 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink-dim">
            <Flame className="size-4 text-accent-orange animate-flame" />
            <span className="text-xs uppercase tracking-widest text-ink-muted">
              {t.dashboard.streakTitle}
            </span>
          </div>
          <span className="text-xs text-ink-muted">
            {locale === "ru" ? "PR:" : "PR:"} {bestStreak}
          </span>
        </div>

        <div>
          <div className="font-display text-display-lg font-bold leading-none">
            <span className="text-gradient-lime">{days}</span>
            <span className="text-ink-dim text-3xl ml-3 font-sans font-normal">
              {locale === "ru" ? "д" : "d"}
            </span>
          </div>
          <div className="text-sm text-ink-dim mt-2">
            {t.dashboard.streakSubtitle}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: dotsToShow }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.02 * i, duration: 0.25 }}
              className="size-3 rounded-full bg-lime-gradient shadow-glow"
            />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={`f-${i}`}
              className="size-3 rounded-full border border-line bg-white/[0.04]"
            />
          ))}
        </div>

        <Button size="sm" variant="primary" className="self-start">
          {t.dashboard.keepStreak}
        </Button>
      </div>
    </div>
  );
}
