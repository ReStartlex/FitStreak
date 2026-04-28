import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

import { PublicProfileClient } from "./client";

interface Params {
  username: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { name: true, username: true, currentStreak: true, level: true },
  });
  if (!user) return { title: "Profile not found — FitStreak" };
  const display = user.name ?? user.username ?? "Athlete";
  return {
    title: `${display} — FitStreak`,
    description: `${display} · level ${user.level} · streak ${user.currentStreak}.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  const normalized = username.toLowerCase();

  const session = await auth();
  const me = session?.user?.id ?? null;

  const user = await db.user.findUnique({
    where: { username: normalized },
    // We deliberately do NOT select email, passwordHash, age, weightKg,
    // heightCm, gender — public profile must stay privacy-safe.
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      level: true,
      totalXp: true,
      totalEnergy: true,
      currentStreak: true,
      bestStreak: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const [todayAgg, weekAgg, topExercises, achievementsCount, energyRank] =
    await Promise.all([
      db.activityRecord.aggregate({
        where: { userId: user.id, recordedAt: { gte: today } },
        _sum: { energy: true, amount: true },
      }),
      db.activityRecord.aggregate({
        where: { userId: user.id, recordedAt: { gte: weekStart } },
        _sum: { energy: true, amount: true },
      }),
      db.activityRecord.groupBy({
        by: ["exerciseId"],
        where: { userId: user.id },
        _sum: { amount: true, energy: true },
        orderBy: { _sum: { energy: "desc" } },
        take: 5,
      }),
      db.userAchievement.count({ where: { userId: user.id } }),
      db.user.count({
        where: { totalEnergy: { gt: user.totalEnergy } },
      }),
    ]);

  return (
    <>
      <Header />
      <main>
        <PublicProfileClient
          user={{
            id: user.id,
            name: user.name ?? user.username ?? "Athlete",
            username: user.username,
            image: user.image,
            level: user.level,
            totalXp: user.totalXp,
            totalEnergy: user.totalEnergy,
            currentStreak: user.currentStreak,
            bestStreak: user.bestStreak,
            joinedAt: user.createdAt.toISOString(),
            rank: energyRank + 1,
            achievementsCount,
            todayEnergy: todayAgg._sum.energy ?? 0,
            todayAmount: todayAgg._sum.amount ?? 0,
            weekEnergy: weekAgg._sum.energy ?? 0,
            weekAmount: weekAgg._sum.amount ?? 0,
            topExercises: topExercises.map((e) => ({
              exerciseId: e.exerciseId,
              amount: e._sum.amount ?? 0,
              energy: e._sum.energy ?? 0,
            })),
          }}
          isSelf={me === user.id}
        />
      </main>
      <Footer />
    </>
  );
}
