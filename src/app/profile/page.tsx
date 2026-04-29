import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfToday, userToBodyMetrics } from "@/lib/api/activity-service";
import { activityBreakdown } from "@/lib/scoring";
import { buildMetadata } from "@/lib/seo/metadata";

import { ProfileClient } from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Мой профиль",
  description: "Личный профиль FitStreak: серия, уровень, активности и достижения.",
  path: "/profile",
  noIndex: true,
});

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/profile");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/signin");
  if (!user.onboarded) redirect("/onboarding");

  const today = startOfToday();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(today);
  monthStart.setDate(monthStart.getDate() - 6 * 7 - 1);

  const [todayAgg, weekAgg, totals, weekRecords, todayRecords, monthRecords, exerciseAgg, energyRank] =
    await Promise.all([
      db.activityRecord.aggregate({
        where: { userId: user.id, recordedAt: { gte: today } },
        _sum: { energy: true, xp: true, kcal: true },
      }),
      db.activityRecord.aggregate({
        where: { userId: user.id, recordedAt: { gte: weekStart } },
        _sum: { energy: true, xp: true, kcal: true },
      }),
      db.activityRecord.aggregate({
        where: { userId: user.id },
        _count: { _all: true },
        _sum: { amount: true, energy: true, kcal: true },
      }),
      db.activityRecord.findMany({
        where: { userId: user.id, recordedAt: { gte: weekStart } },
        select: { exerciseId: true, amount: true },
      }),
      db.activityRecord.findMany({
        where: { userId: user.id, recordedAt: { gte: today } },
        select: { exerciseId: true, amount: true },
      }),
      db.activityRecord.findMany({
        where: { userId: user.id, recordedAt: { gte: monthStart } },
        select: { recordedAt: true, energy: true },
      }),
      db.activityRecord.groupBy({
        by: ["exerciseId"],
        where: { userId: user.id },
        _sum: { energy: true, amount: true },
        orderBy: { _sum: { energy: "desc" } },
        take: 5,
      }),
      db.user.count({ where: { totalEnergy: { gt: user.totalEnergy } } }),
    ]);

  const heatmap: Record<string, number> = {};
  for (const r of monthRecords) {
    const key = r.recordedAt.toISOString().slice(0, 10);
    heatmap[key] = (heatmap[key] ?? 0) + r.energy;
  }

  const breakdown = activityBreakdown([...weekRecords, ...todayRecords]);
  const fav = exerciseAgg[0];
  const totalAggEnergy = exerciseAgg.reduce((a, b) => a + (b._sum.energy ?? 0), 0);
  const favouritePct =
    fav && totalAggEnergy > 0
      ? Math.round(((fav._sum.energy ?? 0) / totalAggEnergy) * 100)
      : null;

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        username: user.username,
        image: user.image,
        plan: user.plan,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        totalXp: user.totalXp,
        totalEnergy: user.totalEnergy,
        level: user.level,
        rank: energyRank + 1,
        streakFreezes: user.streakFreezes,
      }}
      bodyMetrics={{
        gender: user.gender,
        age: user.age,
        heightCm: user.heightCm,
        weightKg: user.weightKg,
        fitnessLevel: user.fitnessLevel,
        goal: user.goal,
      }}
      analytics={{
        todayKcal: todayAgg._sum.kcal ?? 0,
        weekKcal: weekAgg._sum.kcal ?? 0,
        weightKg: user.weightKg,
        age: user.age,
        breakdown,
      }}
      stats={{
        totalRecords: totals._count._all,
        totalAmount: totals._sum.amount ?? 0,
        totalEnergy: totals._sum.energy ?? 0,
        totalKcal: totals._sum.kcal ?? 0,
        weekEnergy: weekAgg._sum.energy ?? 0,
        todayEnergy: todayAgg._sum.energy ?? 0,
        favouriteExerciseId: fav?.exerciseId ?? null,
        favouritePct,
      }}
      bodyMetricsForKcal={userToBodyMetrics(user) ?? null}
      heatmap={heatmap}
    />
  );
}
