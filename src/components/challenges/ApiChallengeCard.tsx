"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";

export interface ApiChallengeView {
  id: string;
  slug: string;
  title: { ru: string; en: string };
  description: { ru: string; en: string };
  metric: "REPS" | "KM" | "MINUTES" | "ENERGY" | "STREAK_DAYS" | "DAYS_ACTIVE";
  exerciseId: string | null;
  goal: number;
  durationDays: number;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ELITE";
  rewardXp: number;
  participantsCount: number;
  isFeatured: boolean;
  type: "PUBLIC" | "FRIENDS" | "PERSONAL";
  endsAt: string | null;
  createdAt: string;
  myProgress: number | null;
  joined: boolean;
  completed: boolean;
}

const METRIC_TONE: Record<ApiChallengeView["metric"], string> = {
  REPS: "from-lime/22 to-transparent",
  KM: "from-accent-cyan/22 to-transparent",
  MINUTES: "from-accent-orange/22 to-transparent",
  ENERGY: "from-violet/22 to-transparent",
  STREAK_DAYS: "from-accent-rose/22 to-transparent",
  DAYS_ACTIVE: "from-lime/22 to-transparent",
};

const ICON_BY_METRIC: Record<ApiChallengeView["metric"], string> = {
  REPS: "💪",
  KM: "🏃",
  MINUTES: "⏱️",
  ENERGY: "⚡",
  STREAK_DAYS: "🔥",
  DAYS_ACTIVE: "📅",
};

function unitLabel(
  metric: ApiChallengeView["metric"],
  locale: "ru" | "en",
): string {
  const m: Record<ApiChallengeView["metric"], { ru: string; en: string }> = {
    REPS: { ru: "повт", en: "reps" },
    KM: { ru: "км", en: "km" },
    MINUTES: { ru: "мин", en: "min" },
    ENERGY: { ru: "ES", en: "ES" },
    STREAK_DAYS: { ru: "дней", en: "days" },
    DAYS_ACTIVE: { ru: "дней", en: "days" },
  };
  return m[metric][locale];
}

function timeLeft(endsAt: string | null, locale: "ru" | "en"): string {
  if (!endsAt) return locale === "ru" ? "—" : "—";
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return locale === "ru" ? "Завершён" : "Ended";
  const days = Math.floor(ms / (24 * 60 * 60_000));
  const hours = Math.floor((ms % (24 * 60 * 60_000)) / (60 * 60_000));
  if (days > 0) return `${days}${locale === "ru" ? "д" : "d"} ${hours}${locale === "ru" ? "ч" : "h"}`;
  return `${hours}${locale === "ru" ? "ч" : "h"}`;
}

export function ApiChallengeCard({
  c,
  index = 0,
}: {
  c: ApiChallengeView;
  index?: number;
}) {
  const { t, locale } = useI18n();
  const progress = c.myProgress ?? 0;
  const pct = Math.min(100, Math.round((progress / c.goal) * 100));

  const typeLabel =
    c.type === "PERSONAL"
      ? locale === "ru"
        ? "Личный"
        : "Personal"
      : c.type === "FRIENDS"
        ? locale === "ru"
          ? "Дружеский"
          : "Friends"
        : locale === "ru"
          ? "Публичный"
          : "Public";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="surface p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden hover:border-line-strong transition-colors"
    >
      <div
        className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${METRIC_TONE[c.metric]} pointer-events-none`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="text-3xl">{ICON_BY_METRIC[c.metric]}</div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant={
              c.type === "PERSONAL"
                ? "default"
                : c.type === "FRIENDS"
                  ? "violet"
                  : "lime"
            }
          >
            {typeLabel}
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
          {locale === "ru" ? c.title.ru : c.title.en}
        </h3>
        <p className="text-sm text-ink-dim mt-1.5 line-clamp-2">
          {locale === "ru" ? c.description.ru : c.description.en}
        </p>
      </div>

      <div className="relative flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between text-xs text-ink-dim">
          <span className="number-tabular text-ink">
            {formatNumber(progress, locale)} / {formatNumber(c.goal, locale)}{" "}
            {unitLabel(c.metric, locale)}
          </span>
          <span className="number-tabular">{pct}%</span>
        </div>
        <Progress value={progress} max={c.goal} tone="lime" size="sm" />
        <div className="flex items-center justify-between text-xs text-ink-muted mt-1">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {formatNumber(c.participantsCount, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {timeLeft(c.endsAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Award className="size-3 text-lime" />
            +{c.rewardXp} XP
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
