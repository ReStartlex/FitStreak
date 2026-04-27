"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { ACHIEVEMENTS } from "@/lib/mock/achievements";
import { cn } from "@/lib/cn";

const RARITY_TONE = {
  common: "border-line",
  rare: "border-accent-cyan/40",
  epic: "border-violet/50",
  legendary: "border-lime/60 shadow-glow",
} as const;

export function AchievementsGrid({ limit }: { limit?: number }) {
  const { t, locale } = useI18n();
  const items = limit ? ACHIEVEMENTS.slice(0, limit) : ACHIEVEMENTS;

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
        <span className="text-xs text-ink-muted number-tabular">
          {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className={cn(
              "relative rounded-2xl border bg-white/[0.02] p-3 flex flex-col items-center text-center gap-1.5 transition-colors",
              RARITY_TONE[a.rarity],
              !a.unlocked && "opacity-60",
            )}
          >
            {!a.unlocked && (
              <div className="absolute top-2 right-2">
                <Lock className="size-3 text-ink-muted" />
              </div>
            )}
            <div className="text-3xl">{a.emoji}</div>
            <div className="text-xs font-medium leading-tight">
              {locale === "ru" ? a.titleRu : a.titleEn}
            </div>
            <div className="text-[10px] text-ink-muted leading-snug">
              {locale === "ru" ? a.descRu : a.descEn}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
