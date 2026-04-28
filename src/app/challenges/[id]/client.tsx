"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Check,
  Clock,
  Flame,
  ListChecks,
  Loader2,
  Share2,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";

interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  level: number;
  streak: number;
  progress: number;
  completed: boolean;
  isMe: boolean;
}

interface DetailView {
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
  rewardEnergy: number;
  participantsCount: number;
  isFeatured: boolean;
  type: "PUBLIC" | "FRIENDS" | "PERSONAL";
  createdById: string | null;
  endsAt: string | null;
  createdAt: string;
  leaderboard: LeaderboardRow[];
  myProgress: number | null;
  joined: boolean;
  completed: boolean;
}

function unitLabel(metric: DetailView["metric"], locale: "ru" | "en"): string {
  const m: Record<DetailView["metric"], { ru: string; en: string }> = {
    REPS: { ru: "повторений", en: "reps" },
    KM: { ru: "км", en: "km" },
    MINUTES: { ru: "минут", en: "min" },
    ENERGY: { ru: "ES", en: "ES" },
    STREAK_DAYS: { ru: "дней", en: "days" },
    DAYS_ACTIVE: { ru: "дней", en: "days" },
  };
  return m[metric][locale];
}

function timeLeftParts(
  endsAt: string | null,
  durationDays: number,
  createdAt: string,
): { days: number; hours: number; ended: boolean } {
  const end = endsAt
    ? new Date(endsAt).getTime()
    : new Date(createdAt).getTime() + durationDays * 24 * 60 * 60_000;
  const ms = end - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, ended: true };
  const days = Math.floor(ms / (24 * 60 * 60_000));
  const hours = Math.floor((ms % (24 * 60 * 60_000)) / (60 * 60_000));
  return { days, hours, ended: false };
}

export function ChallengeDetailClient({
  challenge,
  isAuthed,
}: {
  challenge: DetailView;
  isAuthed: boolean;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [joining, setJoining] = React.useState(false);
  const [joined, setJoined] = React.useState(challenge.joined);
  const [shareTip, setShareTip] = React.useState(false);

  const progress = challenge.myProgress ?? 0;
  const pct = Math.min(100, Math.round((progress / challenge.goal) * 100));
  const time = timeLeftParts(
    challenge.endsAt,
    challenge.durationDays,
    challenge.createdAt,
  );

  const onJoin = async () => {
    if (!isAuthed) {
      router.push(`/signin?from=/challenges/${challenge.id}`);
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/join`, {
        method: "POST",
      });
      if (res.ok) {
        setJoined(true);
        router.refresh();
      }
    } finally {
      setJoining(false);
    }
  };

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title:
            locale === "ru" ? challenge.title.ru : challenge.title.en,
          url,
        });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareTip(true);
      setTimeout(() => setShareTip(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="container py-8 sm:py-10">
      <Link
        href="/challenges"
        className="inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink mb-6"
      >
        <ArrowLeft className="size-4" />
        {t.common.back}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="surface p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 size-72 rounded-full blur-3xl bg-lime/15" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge
                  variant={
                    challenge.type === "PERSONAL"
                      ? "default"
                      : challenge.type === "FRIENDS"
                        ? "violet"
                        : "lime"
                  }
                >
                  {challenge.type === "PERSONAL"
                    ? locale === "ru"
                      ? "Личный"
                      : "Personal"
                    : challenge.type === "FRIENDS"
                      ? locale === "ru"
                        ? "Дружеский"
                        : "Friends"
                      : locale === "ru"
                        ? "Публичный"
                        : "Public"}
                </Badge>
                {joined && (
                  <Badge variant="success">
                    {locale === "ru" ? "ты участвуешь" : "you're in"}
                  </Badge>
                )}
                {challenge.completed && (
                  <Badge variant="lime">
                    {locale === "ru" ? "Завершено" : "Completed"}
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-display-md sm:text-display-lg font-bold">
                {locale === "ru" ? challenge.title.ru : challenge.title.en}
              </h1>
              <p className="text-ink-dim mt-3 max-w-2xl">
                {locale === "ru"
                  ? challenge.description.ru
                  : challenge.description.en}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Stat
                  icon={<Users className="size-4 text-lime" />}
                  label={t.challenges.participants}
                  value={formatNumber(challenge.participantsCount, locale)}
                />
                <Stat
                  icon={<Clock className="size-4 text-accent-cyan" />}
                  label={locale === "ru" ? "Осталось" : "Time left"}
                  value={
                    time.ended
                      ? locale === "ru"
                        ? "Завершён"
                        : "Ended"
                      : time.days > 0
                        ? `${time.days}${locale === "ru" ? "д" : "d"} ${time.hours}${locale === "ru" ? "ч" : "h"}`
                        : `${time.hours}${locale === "ru" ? "ч" : "h"}`
                  }
                />
                <Stat
                  icon={<Award className="size-4 text-violet-soft" />}
                  label={t.challenges.reward}
                  value={`+${formatNumber(challenge.rewardXp, locale)} XP`}
                />
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-dim">
                    {t.common.progress}:{" "}
                    <span className="text-ink number-tabular">
                      {formatNumber(progress, locale)} /{" "}
                      {formatNumber(challenge.goal, locale)}{" "}
                      {unitLabel(challenge.metric, locale)}
                    </span>
                  </span>
                  <span className="font-display font-bold number-tabular">
                    {pct}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  max={challenge.goal}
                  tone="lime"
                  size="lg"
                  className="mt-2"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 items-center">
                {!joined && !time.ended ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onJoin}
                    disabled={joining}
                    className="gap-2"
                  >
                    {joining ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {t.challenges.join}
                  </Button>
                ) : joined ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-lime text-bg font-medium hover:opacity-90"
                  >
                    {t.common.continue}
                  </Link>
                ) : null}
                <Button
                  variant="outline"
                  size="md"
                  onClick={onShare}
                  className="gap-2"
                >
                  <Share2 className="size-4" />
                  {locale === "ru" ? "Поделиться" : "Share"}
                </Button>
                {shareTip && (
                  <span className="text-xs text-success">
                    {locale === "ru" ? "Ссылка скопирована" : "Link copied"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="size-4 text-lime" />
              <h2 className="font-display text-base font-semibold">
                {t.challenges.details}
              </h2>
            </div>
            <ul className="text-sm text-ink-dim space-y-2 list-disc pl-5">
              <li>
                {locale === "ru" ? "Цель: " : "Goal: "}
                {formatNumber(challenge.goal, locale)}{" "}
                {unitLabel(challenge.metric, locale)}
              </li>
              <li>
                {locale === "ru" ? "Длительность: " : "Duration: "}
                {challenge.durationDays}{" "}
                {locale === "ru" ? "дней" : "days"}
              </li>
              <li>
                {locale === "ru"
                  ? "Все результаты автоматически суммируются"
                  : "Progress is auto-aggregated"}
              </li>
              <li>
                {locale === "ru" ? "Награда: " : "Reward: "}
                +{formatNumber(challenge.rewardXp, locale)} XP
              </li>
              {challenge.type === "PERSONAL" && (
                <li>
                  {locale === "ru"
                    ? "Личный челлендж — виден только тебе."
                    : "Personal challenge — only visible to you."}
                </li>
              )}
            </ul>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="surface p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold mb-4">
              {t.challenges.leaderboardInChallenge}
            </h2>
            {challenge.leaderboard.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-6">
                {locale === "ru"
                  ? "Пока никто не присоединился."
                  : "No participants yet."}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {challenge.leaderboard.map((row, i) => (
                  <li
                    key={row.userId}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
                      row.isMe
                        ? "bg-lime/8 border border-lime/30"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`number-tabular w-7 text-center font-display font-bold text-sm ${
                        i < 3 ? "text-lime" : "text-ink-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Avatar
                      name={row.name}
                      size={32}
                      tone={i < 3 ? "lime" : row.isMe ? "lime" : "default"}
                      src={row.avatar ?? undefined}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {row.name}
                      </div>
                      <div className="text-[10px] text-ink-muted flex items-center gap-2">
                        <span>lv {row.level}</span>
                        {row.streak > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-accent-orange">
                            <Flame className="size-2.5" /> {row.streak}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-display font-bold number-tabular text-sm">
                      {formatNumber(row.progress, locale)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-xs text-ink-muted uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display font-semibold text-base">{value}</div>
    </div>
  );
}
