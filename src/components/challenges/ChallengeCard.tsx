"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useI18n } from "@/lib/i18n/provider";
import { Challenge } from "@/lib/mock/challenges";
import { formatNumber } from "@/lib/format";

const TONE_BG: Record<Challenge["tone"], string> = {
  lime: "from-lime/22 to-transparent",
  violet: "from-violet/22 to-transparent",
  rose: "from-accent-rose/22 to-transparent",
  cyan: "from-accent-cyan/22 to-transparent",
  orange: "from-accent-orange/22 to-transparent",
};

const TONE_PROGRESS: Record<Challenge["tone"], "lime" | "violet" | "rose" | "cyan"> = {
  lime: "lime",
  violet: "violet",
  rose: "rose",
  cyan: "cyan",
  orange: "lime",
};

export function ChallengeCard({
  c,
  index = 0,
}: {
  c: Challenge;
  index?: number;
}) {
  const { t, locale } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="surface p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden hover:border-line-strong transition-colors"
    >
      <div
        className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${TONE_BG[c.tone]} pointer-events-none`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="text-3xl">{c.badge}</div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={c.type === "personal" ? "default" : c.type === "friends" ? "violet" : "lime"}>
            {c.type === "personal"
              ? locale === "ru"
                ? "Личный"
                : "Personal"
              : c.type === "friends"
                ? locale === "ru"
                  ? "Дружеский"
                  : "Friends"
                : locale === "ru"
                  ? "Публичный"
                  : "Public"}
          </Badge>
          {c.joined && (
            <span className="text-[10px] text-success uppercase tracking-widest">
              {locale === "ru" ? "ты в нём" : "you're in"}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          {locale === "ru" ? c.titleRu : c.titleEn}
        </h3>
        <p className="text-sm text-ink-dim mt-1.5 line-clamp-2">
          {locale === "ru" ? c.descRu : c.descEn}
        </p>
      </div>

      <div className="relative flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between text-xs text-ink-dim">
          <span className="number-tabular text-ink">
            {formatNumber(c.progress, locale)} / {formatNumber(c.goal, locale)}{" "}
            {locale === "ru" ? c.unitRu : c.unitEn}
          </span>
          <span className="number-tabular">
            {Math.min(100, Math.round((c.progress / c.goal) * 100))}%
          </span>
        </div>
        <Progress
          value={c.progress}
          max={c.goal}
          tone={TONE_PROGRESS[c.tone]}
          size="sm"
        />
        <div className="flex items-center justify-between text-xs text-ink-muted mt-1">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {formatNumber(c.participants, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {c.endsInHours}
            {locale === "ru" ? "ч" : "h"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Award className="size-3 text-lime" />
            {c.rewardRu.includes("XP")
              ? "+XP"
              : locale === "ru"
                ? "Бейдж"
                : "Badge"}
          </span>
        </div>

        <Link
          href={`/challenges/${c.id}`}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-line bg-white/[0.04] text-sm hover:bg-white/[0.08] hover:border-line-strong transition-colors"
        >
          {c.joined ? t.common.continue : t.challenges.join}
        </Link>
      </div>
    </motion.div>
  );
}
