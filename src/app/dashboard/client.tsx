"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { QuickLog } from "@/components/dashboard/QuickLog";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { LevelCard } from "@/components/dashboard/LevelCard";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { ActivityFeed, type FeedRecord } from "@/components/dashboard/ActivityFeed";
import {
  PersonalStats,
  type PersonalStatsData,
} from "@/components/dashboard/PersonalStats";
import { AchievementsGrid } from "@/components/dashboard/AchievementsGrid";
import { MiniLeaderboard } from "@/components/dashboard/MiniLeaderboard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/provider";
import { divisionName, getDivision } from "@/lib/ranks";
import type { LevelInfo } from "@/lib/leveling";

interface UserCtx {
  id: string;
  name: string;
  email: string;
  image: string | null;
  currentStreak: number;
  bestStreak: number;
  totalXp: number;
  totalEnergy: number;
  level: number;
  dailyGoal: number;
  bodyMetrics: unknown;
}

interface Totals {
  energy: number;
  xp: number;
  kcal: number;
  amount?: number;
}

interface Props {
  user: UserCtx;
  initialToday: Totals;
  week: Totals;
  personalStats: PersonalStatsData;
  heatmap: Record<string, number>;
  recentRecords: FeedRecord[];
  levelInfo: LevelInfo;
}

export function DashboardClient({
  user,
  initialToday,
  week,
  personalStats: initialStats,
  heatmap: initialHeatmap,
  recentRecords: initialRecords,
  levelInfo: initialLevelInfo,
}: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [today, setToday] = React.useState(initialToday);
  const [totalXp, setTotalXp] = React.useState(user.totalXp);
  const [totalEnergy, setTotalEnergy] = React.useState(user.totalEnergy);
  const [level, setLevel] = React.useState(user.level);
  const [streak, setStreak] = React.useState(user.currentStreak);
  const [bestStreak, setBestStreak] = React.useState(user.bestStreak);
  const [recentRecords, setRecentRecords] = React.useState<FeedRecord[]>(
    initialRecords,
  );
  const [heatmap, setHeatmap] = React.useState(initialHeatmap);
  const [pStats, setPStats] = React.useState(initialStats);

  const division = getDivision(level);

  async function handleAdd(
    exerciseId: string,
    amount: number,
    optimisticEnergy: number,
    optimisticXp: number,
  ) {
    const optimisticToday = {
      energy: today.energy + optimisticEnergy,
      xp: today.xp + optimisticXp,
      kcal: today.kcal,
    };
    setToday(optimisticToday);
    setTotalXp((v) => v + optimisticXp);
    setTotalEnergy((v) => v + optimisticEnergy);

    const res = await fetch("/api/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ exerciseId, amount }),
    });

    if (!res.ok) {
      setToday(today);
      setTotalXp(user.totalXp);
      setTotalEnergy(user.totalEnergy);
      throw new Error("save_failed");
    }

    const json = (await res.json()) as {
      record: FeedRecord & { kcal: number; recordedAt: string };
      totals: {
        todayEnergy: number;
        todayXp: number;
        todayKcal: number;
        totalEnergy: number;
        totalXp: number;
        level: number;
        levelUp: boolean;
        currentStreak: number;
        bestStreak: number;
      };
    };

    setToday({
      energy: json.totals.todayEnergy,
      xp: json.totals.todayXp,
      kcal: json.totals.todayKcal,
    });
    setTotalEnergy(json.totals.totalEnergy);
    setTotalXp(json.totals.totalXp);
    setLevel(json.totals.level);
    setStreak(json.totals.currentStreak);
    setBestStreak(json.totals.bestStreak);

    const newRecord: FeedRecord = {
      id: json.record.id,
      exerciseId: json.record.exerciseId,
      amount: json.record.amount,
      energy: json.record.energy,
      xp: json.record.xp,
      recordedAt: json.record.recordedAt,
    };
    setRecentRecords((rs) => [newRecord, ...rs].slice(0, 12));

    const recordEnergy = json.record.energy ?? 0;
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    const key = today0.toISOString().slice(0, 10);
    setHeatmap((h) => ({ ...h, [key]: (h[key] ?? 0) + recordEnergy }));

    setPStats((s) => ({
      ...s,
      weekEnergy: (s.weekEnergy ?? 0) + recordEnergy,
      totalEnergy: json.totals.totalEnergy,
    }));
  }

  React.useEffect(() => {
    void initialLevelInfo;
  }, [initialLevelInfo]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t.dashboard.greetingMorning;
    if (h < 18) return t.dashboard.greetingDay;
    return t.dashboard.greetingEvening;
  })();

  return (
    <>
      <Header />
      <main className="container py-8 sm:py-10">
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar
              name={user.name}
              size={48}
              tone="lime"
              src={user.image ?? undefined}
            />
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-muted">
                {greeting}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                {user.name.split(" ")[0]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="lime">
              {t.common.level} {level}
            </Badge>
            <Badge variant="violet">{divisionName(division, locale)}</Badge>
            <Badge variant="default">
              🔥 {streak} {locale === "ru" ? "д" : "d"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <TodayCard
              todayEnergy={today.energy}
              todayXp={today.xp}
              todayKcal={today.kcal}
              goal={user.dailyGoal}
            />
            <QuickLog
              onAdd={(exId, amt, e, x) => handleAdd(exId, amt, e, x)}
            />
            <Heatmap weeks={16} data={heatmap} />
            <PersonalStats data={pStats} />
            <AchievementsGrid limit={8} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-5">
            <LevelCard totalXp={totalXp} todayXp={today.xp} />
            <StreakCard current={streak} best={bestStreak} />
            <MiniLeaderboard myUserId={user.id} />
            <ActivityFeed records={recentRecords} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
