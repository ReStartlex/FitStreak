"use client";

import { motion } from "framer-motion";
import { Activity, Flame, Snowflake, Target, Trophy, Zap } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { LevelCard } from "@/components/dashboard/LevelCard";
import { AchievementsGrid } from "@/components/dashboard/AchievementsGrid";
import { BodyMetricsCard, type BodyMetricsValue } from "@/components/profile/BodyMetricsCard";
import { AnalyticsCard, type AnalyticsData } from "@/components/profile/AnalyticsCard";
import { useI18n } from "@/lib/i18n/provider";
import { divisionName, getDivision } from "@/lib/ranks";
import { getLevelInfo } from "@/lib/leveling";
import { getExerciseName } from "@/lib/mock/exercises";

interface UserCtx {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image: string | null;
  plan: string;
  currentStreak: number;
  bestStreak: number;
  totalXp: number;
  totalEnergy: number;
  level: number;
  rank: number;
  streakFreezes: number;
}

interface Props {
  user: UserCtx;
  bodyMetrics: BodyMetricsValue;
  analytics: AnalyticsData;
  stats: {
    totalRecords: number;
    totalAmount: number;
    totalEnergy: number;
    totalKcal: number;
    weekEnergy: number;
    todayEnergy: number;
    favouriteExerciseId: string | null;
    favouritePct: number | null;
  };
  bodyMetricsForKcal: unknown;
  heatmap: Record<string, number>;
}

export function ProfileClient({
  user,
  bodyMetrics,
  analytics,
  stats,
  heatmap,
}: Props) {
  const { t, locale } = useI18n();
  const levelInfo = getLevelInfo(user.totalXp);
  const division = getDivision(levelInfo.level);

  const goalCompletionRate =
    stats.weekEnergy > 0 ? Math.min(100, Math.round((stats.weekEnergy / 700) * 100)) : 0;

  return (
    <>
      <Header />
      <main className="container py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="surface p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-lime opacity-50 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-violet opacity-30 pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-30 mask-fade-b pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Avatar
              name={user.name}
              size={96}
              tone="lime"
              src={user.image ?? undefined}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="lime">
                  {t.profile.level} {levelInfo.level}
                </Badge>
                <Badge variant="violet">{divisionName(division, locale)}</Badge>
                <Badge variant="default">
                  #{user.rank} {t.common.global.toLowerCase()}
                </Badge>
                <Badge variant="default">
                  🔥 {user.currentStreak} {locale === "ru" ? "д" : "d"}
                </Badge>
                {user.plan !== "FREE" && (
                  <Badge variant="lime">{user.plan}</Badge>
                )}
              </div>
              <h1 className="font-display text-display-md font-bold">
                {user.name}
              </h1>
              <p className="text-ink-muted text-sm">
                {user.username ? `@${user.username}` : user.email}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-12 mt-6">
          <div className="lg:col-span-8">
            <BodyMetricsCard initial={bodyMetrics} />
          </div>
          <div className="lg:col-span-4">
            <LevelCard totalXp={user.totalXp} todayXp={stats.todayEnergy} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 mt-5">
          <StatBox
            icon={<Zap className="size-4 text-lime" />}
            label={t.scoring.energyScore}
            value={user.totalEnergy}
            suffix={t.scoring.energyShort}
            sub={`+${stats.todayEnergy} ${t.common.today.toLowerCase()}`}
          />
          <StatBox
            icon={<Flame className="size-4 text-accent-orange" />}
            label={t.common.streak}
            value={user.currentStreak}
            suffix={locale === "ru" ? "дней" : "days"}
            sub={`PR: ${user.bestStreak}`}
          />
          <StatBox
            icon={<Activity className="size-4 text-violet-soft" />}
            label={locale === "ru" ? "Записей всего" : "Logs"}
            value={stats.totalRecords}
            sub={`${stats.totalKcal} kcal`}
          />
          <StatBox
            icon={<Target className="size-4 text-accent-cyan" />}
            label={t.profile.goalRate}
            value={goalCompletionRate}
            suffix="%"
            sub={locale === "ru" ? "за неделю" : "this week"}
          />
          <StatBox
            icon={<Snowflake className="size-4" style={{ color: "#7de3ff" }} />}
            label={t.streak.freezeTitle}
            value={user.streakFreezes}
            suffix={locale === "ru" ? "шт" : "left"}
            sub={
              user.streakFreezes > 0
                ? locale === "ru"
                  ? "Защити серию"
                  : "Protect your streak"
                : locale === "ru"
                  ? "Получай новые с уровнями"
                  : "Earn more with levels"
            }
          />
        </div>

        <div className="mt-5">
          <AnalyticsCard data={analytics} />
        </div>

        <div className="mt-5">
          <Heatmap weeks={20} data={heatmap} />
        </div>

        <div className="mt-5">
          <AchievementsGrid />
        </div>

        {stats.favouriteExerciseId && (
          <div className="grid gap-5 lg:grid-cols-3 mt-5">
            <div className="surface p-5 sm:p-6 lg:col-span-2">
              <h3 className="font-display text-base font-semibold mb-3">
                {t.profile.favourite}
              </h3>
              <div className="font-display text-2xl font-bold">
                {getExerciseName(stats.favouriteExerciseId, locale)}
              </div>
              <p className="text-xs text-ink-muted mt-1">
                {stats.favouritePct
                  ? `${stats.favouritePct}% ${locale === "ru" ? "вашего вклада" : "of your contribution"}`
                  : ""}
              </p>
            </div>
            <div className="surface p-5 sm:p-6">
              <div className="text-xs uppercase tracking-widest text-ink-muted mb-2 flex items-center gap-1.5">
                <Trophy className="size-3.5 text-violet-soft" />
                {locale === "ru" ? "Аккаунт" : "Account"}
              </div>
              <p className="text-sm text-ink-dim">{user.email}</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function StatBox({
  icon,
  label,
  value,
  suffix,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
}) {
  const { locale } = useI18n();
  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-muted">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold number-tabular">
        <AnimatedNumber value={value} locale={locale} />
        {suffix && (
          <span className="ml-2 text-base text-ink-dim font-sans font-normal">
            {suffix}
          </span>
        )}
      </div>
      {sub && <div className="text-xs text-ink-muted mt-1">{sub}</div>}
    </div>
  );
}
