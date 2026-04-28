"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  Trophy,
  Zap,
  Calendar,
  Activity,
  Settings,
  Crown,
  UserPlus,
  UserCheck,
  Share2,
  Loader2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { getExerciseName, getExercise } from "@/lib/mock/exercises";
import { getLevelInfo } from "@/lib/leveling";

interface PublicUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  level: number;
  totalXp: number;
  totalEnergy: number;
  currentStreak: number;
  bestStreak: number;
  joinedAt: string;
  rank: number;
  achievementsCount: number;
  todayEnergy: number;
  todayAmount: number;
  weekEnergy: number;
  weekAmount: number;
  topExercises: Array<{ exerciseId: string; amount: number; energy: number }>;
}

export function PublicProfileClient({
  user,
  isSelf,
  isAuthed,
  initialFollowing,
  heatmap,
}: {
  user: PublicUser;
  isSelf: boolean;
  isAuthed: boolean;
  initialFollowing: boolean;
  heatmap: Record<string, number>;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const lvl = getLevelInfo(user.totalXp);
  const memberSince = new Date(user.joinedAt).toLocaleDateString(
    locale === "ru" ? "ru-RU" : "en-US",
    { month: "short", year: "numeric" },
  );

  const [following, setFollowing] = React.useState(initialFollowing);
  const [followPending, setFollowPending] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  const heatmapHasData = React.useMemo(
    () => Object.values(heatmap).some((v) => v > 0),
    [heatmap],
  );

  async function toggleFollow() {
    if (!isAuthed) {
      router.push(
        `/signin?from=${encodeURIComponent(`/u/${user.username ?? ""}`)}`,
      );
      return;
    }
    setFollowPending(true);
    const method = following ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/follow/${user.id}`, { method });
      if (res.ok) {
        setFollowing((v) => !v);
        toast(
          following
            ? locale === "ru"
              ? `Отписался от ${user.name}`
              : `Unfollowed ${user.name}`
            : locale === "ru"
              ? `Подписан на ${user.name}`
              : `Following ${user.name}`,
          { tone: "success" },
        );
      } else {
        toast(
          locale === "ru" ? "Не получилось" : "Something went wrong",
          { tone: "error" },
        );
      }
    } catch {
      toast(
        locale === "ru" ? "Сеть недоступна" : "Network unavailable",
        { tone: "error" },
      );
    } finally {
      setFollowPending(false);
    }
  }

  async function shareProfile() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/u/${user.username ?? ""}`
        : "";
    const title = `${user.name} · FitStreak`;
    const text =
      locale === "ru"
        ? `${user.name} держит серию ${user.currentStreak} дн. на FitStreak.`
        : `${user.name} is on a ${user.currentStreak}-day streak on FitStreak.`;
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator).share({ title, text, url });
        return;
      }
    } catch {
      // user cancelled the native sheet — silently fall back to copy
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // last resort: ignore
    }
  }

  return (
    <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-radial-violet opacity-50" />
        <div className="absolute inset-0 bg-radial-lime opacity-40" />
      </div>

      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="surface p-5 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-8 items-start sm:items-center"
        >
          <div className="relative shrink-0">
            <Avatar
              name={user.name}
              src={user.image ?? undefined}
              size={96}
              tone={user.currentStreak >= 30 ? "lime" : "default"}
            />
            {user.rank <= 10 && (
              <span className="absolute -bottom-1 -right-1 grid place-items-center size-7 rounded-full bg-lime text-bg shadow-glow">
                <Crown className="size-4" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {user.name}
            </h1>
            {user.username && (
              <div className="text-sm text-ink-muted mt-1">
                @{user.username}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="lime" className="gap-1">
                <Zap className="size-3" />
                {t.common.level} {user.level}
              </Badge>
              <Badge variant="default" className="gap-1">
                <Flame className="size-3 text-accent-orange" />
                <span className="number-tabular">{user.currentStreak}</span>
                <span className="opacity-70">
                  {locale === "ru" ? "д" : "d"}
                </span>
              </Badge>
              <Badge variant="violet" className="gap-1">
                <Trophy className="size-3" />#{user.rank}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="size-3" />
                {locale === "ru" ? "с" : "since"} {memberSince}
              </Badge>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 self-stretch sm:self-center w-full sm:w-auto">
            {isSelf ? (
              <Link href="/settings" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="gap-2 w-full sm:w-auto">
                  <Settings className="size-4" />
                  {t.nav.settings}
                </Button>
              </Link>
            ) : (
              <Button
                variant={following ? "secondary" : "primary"}
                onClick={toggleFollow}
                disabled={followPending}
                className="gap-2 flex-1 sm:flex-none"
              >
                {followPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : following ? (
                  <UserCheck className="size-4" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {following
                  ? locale === "ru"
                    ? "Подписан"
                    : "Following"
                  : locale === "ru"
                    ? "Подписаться"
                    : "Follow"}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={shareProfile}
              className="gap-2 flex-1 sm:flex-none"
            >
              <Share2 className="size-4" />
              {shared
                ? locale === "ru"
                  ? "Скопировано"
                  : "Copied"
                : locale === "ru"
                  ? "Поделиться"
                  : "Share"}
            </Button>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="mt-5 grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={locale === "ru" ? "Серия" : "Streak"}
            value={user.currentStreak}
            sub={
              user.bestStreak > user.currentStreak
                ? `${locale === "ru" ? "лучшая" : "best"} ${user.bestStreak}`
                : locale === "ru"
                  ? "сейчас"
                  : "now"
            }
            tone="orange"
            icon={<Flame className="size-4" />}
          />
          <StatCard
            label={locale === "ru" ? "Уровень" : "Level"}
            value={user.level}
            sub={
              lvl.isMax
                ? locale === "ru"
                  ? "макс"
                  : "max"
                : `${Math.round(lvl.progress)}%`
            }
            tone="lime"
            icon={<Zap className="size-4" />}
          />
          <StatCard
            label={t.scoring.energyShort}
            value={user.totalEnergy}
            sub={locale === "ru" ? "всего" : "lifetime"}
            tone="violet"
            icon={<Activity className="size-4" />}
          />
          <StatCard
            label={locale === "ru" ? "Бейджи" : "Badges"}
            value={user.achievementsCount}
            sub={locale === "ru" ? "разблокировано" : "unlocked"}
            tone="cyan"
            icon={<Trophy className="size-4" />}
          />
        </div>

        {/* Today / Week */}
        <div className="mt-5 grid gap-3 sm:gap-5 sm:grid-cols-2">
          <PeriodCard
            title={locale === "ru" ? "Сегодня" : "Today"}
            energy={user.todayEnergy}
            amount={user.todayAmount}
          />
          <PeriodCard
            title={locale === "ru" ? "За неделю" : "This week"}
            energy={user.weekEnergy}
            amount={user.weekAmount}
          />
        </div>

        {/* Heatmap (12 weeks) */}
        {heatmapHasData && (
          <div className="mt-5">
            <Heatmap weeks={12} data={heatmap} />
          </div>
        )}

        {/* Top exercises */}
        <div className="mt-5 surface p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">
              {locale === "ru"
                ? "Топ упражнений за всё время"
                : "Top exercises (lifetime)"}
            </h2>
            <Trophy className="size-4 text-lime" />
          </div>
          {user.topExercises.length === 0 ? (
            <div className="text-sm text-ink-muted text-center py-6">
              {locale === "ru"
                ? "Ещё нет записанной активности."
                : "No activity logged yet."}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {user.topExercises.map((row) => {
                const ex = getExercise(row.exerciseId);
                if (!ex) return null;
                const Icon = ex.icon;
                const max = user.topExercises[0].amount || 1;
                const pct = Math.min(100, (row.amount / max) * 100);
                return (
                  <div
                    key={row.exerciseId}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <div className="grid place-items-center size-8 rounded-lg border border-line bg-white/[0.03] shrink-0">
                      <Icon className="size-4 text-lime" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate">
                          {getExerciseName(row.exerciseId, locale)}
                        </span>
                        <span className="number-tabular text-ink-dim ml-2">
                          {formatNumber(row.amount, locale)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
                        <div
                          className="h-full bg-lime-gradient"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        {!isSelf && (
          <div className="mt-6 sm:mt-8 surface p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <div className="font-display text-lg font-semibold">
                {locale === "ru"
                  ? "Догоняй и обходи"
                  : "Catch up and overtake"}
              </div>
              <p className="text-sm text-ink-dim mt-1">
                {locale === "ru"
                  ? "Заведи свою серию — попасть в топ проще, чем кажется."
                  : "Start your own streak — getting to the top is easier than it looks."}
              </p>
            </div>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Zap className="size-4" />
                {t.landing.heroPrimaryCta}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  tone: "lime" | "violet" | "orange" | "cyan";
}) {
  const { locale } = useI18n();
  const toneCls = {
    lime: "text-lime",
    violet: "text-violet-soft",
    orange: "text-accent-orange",
    cyan: "text-accent-cyan",
  }[tone];
  return (
    <div className="surface p-4 sm:p-5">
      <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-widest">
        <span className="truncate">{label}</span>
        <span className={toneCls}>{icon}</span>
      </div>
      <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight number-tabular mt-2">
        {formatNumber(value, locale)}
      </div>
      <div className="text-xs text-ink-muted mt-1 truncate">{sub}</div>
    </div>
  );
}

function PeriodCard({
  title,
  energy,
  amount,
}: {
  title: string;
  energy: number;
  amount: number;
}) {
  const { t, locale } = useI18n();
  return (
    <div className="surface p-5">
      <div className="text-xs text-ink-muted uppercase tracking-widest">
        {title}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <div>
          <span className="font-display text-3xl font-bold number-tabular text-gradient-lime">
            {formatNumber(energy, locale)}
          </span>
          <span className="text-ink-muted text-sm ml-1">
            {t.scoring.energyShort}
          </span>
        </div>
        <div>
          <span className="font-display text-xl font-semibold number-tabular">
            {formatNumber(amount, locale)}
          </span>
          <span className="text-ink-muted text-sm ml-1">{t.common.reps}</span>
        </div>
      </div>
    </div>
  );
}
