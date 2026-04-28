import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfToday, getTodayTotals, userToBodyMetrics } from "@/lib/api/activity-service";
import { getLevelInfo } from "@/lib/leveling";
import { calcDailyGoal } from "@/lib/goals";

import { DashboardClient } from "./client";

export const metadata: Metadata = {
  title: "Dashboard — FitStreak",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/dashboard");

  const userId = session.user.id;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/signin");
  if (!user.onboarded) redirect("/onboarding");

  const today = startOfToday();
  const monthStart = new Date(today);
  monthStart.setDate(monthStart.getDate() - 16 * 7);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const [todayTotals, monthRecords, weekAgg, exerciseAgg] = await Promise.all([
    getTodayTotals(userId),
    db.activityRecord.findMany({
      where: { userId, recordedAt: { gte: monthStart } },
      orderBy: { recordedAt: "desc" },
      select: {
        id: true,
        exerciseId: true,
        amount: true,
        energy: true,
        xp: true,
        recordedAt: true,
      },
    }),
    db.activityRecord.aggregate({
      where: { userId, recordedAt: { gte: weekStart } },
      _sum: { energy: true, xp: true, kcal: true },
    }),
    db.activityRecord.groupBy({
      by: ["exerciseId"],
      where: { userId },
      _sum: { energy: true, amount: true },
      orderBy: { _sum: { energy: "desc" } },
      take: 5,
    }),
  ]);

  const heatmap: Record<string, number> = {};
  for (const r of monthRecords) {
    const key = r.recordedAt.toISOString().slice(0, 10);
    heatmap[key] = (heatmap[key] ?? 0) + r.energy;
  }

  let bestDay: { date: string; energy: number } | null = null;
  for (const [date, energy] of Object.entries(heatmap)) {
    if (!bestDay || energy > bestDay.energy) bestDay = { date, energy };
  }

  const fav = exerciseAgg[0];
  const totalAggEnergy = exerciseAgg.reduce((a, b) => a + (b._sum.energy ?? 0), 0);
  const favouritePct =
    fav && totalAggEnergy > 0
      ? Math.round(((fav._sum.energy ?? 0) / totalAggEnergy) * 100)
      : null;

  const levelInfo = getLevelInfo(user.totalXp);
  const dailyGoal = calcDailyGoal({
    fitnessLevel: user.fitnessLevel,
    age: user.age,
    gender: user.gender,
    goal: user.goal,
    weightKg: user.weightKg,
  });

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        username: user.username,
        image: user.image,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        totalXp: user.totalXp,
        totalEnergy: user.totalEnergy,
        level: user.level,
        dailyGoal,
        streakFreezes: user.streakFreezes,
        bodyMetrics: userToBodyMetrics(user) ?? null,
      }}
      initialToday={todayTotals}
      week={{
        energy: weekAgg._sum.energy ?? 0,
        xp: weekAgg._sum.xp ?? 0,
        kcal: weekAgg._sum.kcal ?? 0,
      }}
      personalStats={{
        weekEnergy: weekAgg._sum.energy ?? 0,
        bestDayEnergy: bestDay?.energy ?? 0,
        bestDayLabel: bestDay?.date ?? undefined,
        favouriteExerciseId: fav?.exerciseId ?? undefined,
        favouritePct: favouritePct ?? undefined,
        totalEnergy: user.totalEnergy,
      }}
      heatmap={heatmap}
      recentRecords={monthRecords.slice(0, 12).map((r) => ({
        id: r.id,
        exerciseId: r.exerciseId,
        amount: r.amount,
        energy: r.energy,
        xp: r.xp,
        recordedAt: r.recordedAt.toISOString(),
      }))}
      levelInfo={levelInfo}
    />
  );
}
