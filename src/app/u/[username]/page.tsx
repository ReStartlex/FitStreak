import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  JsonLd,
  breadcrumbSchema,
  profilePageSchema,
} from "@/lib/seo/jsonld";
import { absoluteUrl } from "@/lib/site";

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
    select: {
      name: true,
      username: true,
      currentStreak: true,
      bestStreak: true,
      level: true,
      isPublic: true,
    },
  });
  if (!user) {
    return buildMetadata({
      title: "Профиль не найден",
      description: "Запрошенный профиль FitStreak не существует или был удалён.",
      path: `/u/${username}`,
      noIndex: true,
    });
  }
  const display = user.name ?? user.username ?? "Athlete";
  const handle = user.username ?? username;
  return buildMetadata({
    title: `${display} (@${handle}) — FitStreak`,
    description: `${display} — уровень ${user.level}, серия ${user.currentStreak} дн. (рекорд ${user.bestStreak}). Смотри активность и достижения на FitStreak.`,
    path: `/u/${handle}`,
    ogType: "profile",
    ogImage: absoluteUrl(`/u/${handle}/opengraph-image`),
    noIndex: !user.isPublic,
    keywords: [
      `${display} fitstreak`,
      `@${handle}`,
      "fitness profile",
      "athlete streak",
      "fitstreak athlete",
    ],
  });
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
      isPublic: true,
    },
  });
  if (!user) notFound();
  // Privacy guard: if owner toggled the profile to private, only the
  // owner themselves can access the page.
  if (!user.isPublic && me !== user.id) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  // Pull a full year of activity in one query — the 12-week heatmap
  // and the year heatmap both source from this map.
  const heatmapStart = new Date(today);
  heatmapStart.setDate(heatmapStart.getDate() - 365);

  // If the visitor blocked this profile (or vice versa) — pretend it
  // doesn't exist. Owners always see their own page.
  if (me && me !== user.id) {
    const block = await db.block.findFirst({
      where: {
        OR: [
          { blockerId: me, blockedId: user.id },
          { blockerId: user.id, blockedId: me },
        ],
      },
      select: { id: true },
    });
    if (block) notFound();
  }

  const [
    todayAgg,
    weekAgg,
    topExercises,
    achievementsCount,
    energyRank,
    heatmapRows,
    isFollowingRow,
    followersCount,
    followingCount,
    recentAchievements,
  ] = await Promise.all([
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
    db.activityRecord.findMany({
      where: { userId: user.id, recordedAt: { gte: heatmapStart } },
      select: { recordedAt: true, energy: true },
    }),
    me && me !== user.id
      ? db.follow.findUnique({
          where: {
            followerId_followingId: { followerId: me, followingId: user.id },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
    db.follow.count({ where: { followingId: user.id } }),
    db.follow.count({ where: { followerId: user.id } }),
    db.userAchievement.findMany({
      where: { userId: user.id },
      orderBy: { lastEarnedAt: "desc" },
      take: 6,
      include: {
        achievement: {
          select: {
            slug: true,
            titleRu: true,
            titleEn: true,
            descRu: true,
            descEn: true,
            icon: true,
            tier: true,
            rewardXp: true,
          },
        },
      },
    }),
  ]);

  const heatmap: Record<string, number> = {};
  for (const r of heatmapRows) {
    const key = r.recordedAt.toISOString().slice(0, 10);
    heatmap[key] = (heatmap[key] ?? 0) + r.energy;
  }

  const display = user.name ?? user.username ?? "Athlete";
  const handle = user.username ?? normalized;

  return (
    <>
      <JsonLd
        id="ld-profile-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Athletes", url: "/leaderboard" },
          { name: `@${handle}`, url: `/u/${handle}` },
        ])}
      />
      <JsonLd
        id="ld-profile-page"
        data={profilePageSchema({
          username: handle,
          displayName: display,
          level: user.level,
          currentStreak: user.currentStreak,
          bestStreak: user.bestStreak,
          joinedAt: user.createdAt.toISOString(),
        })}
      />
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
            followersCount,
            followingCount,
            recentAchievements: recentAchievements.map((ua) => ({
              slug: ua.achievement.slug,
              titleRu: ua.achievement.titleRu,
              titleEn: ua.achievement.titleEn,
              descRu: ua.achievement.descRu,
              descEn: ua.achievement.descEn,
              icon: ua.achievement.icon,
              tier: ua.achievement.tier as
                | "BRONZE"
                | "SILVER"
                | "GOLD"
                | "ELITE"
                | "LEGEND",
              rewardXp: ua.achievement.rewardXp,
              count: ua.count,
              lastEarnedAt: ua.lastEarnedAt.toISOString(),
            })),
          }}
          isSelf={me === user.id}
          isAuthed={Boolean(me)}
          initialFollowing={Boolean(isFollowingRow)}
          heatmap={heatmap}
        />
      </main>
      <Footer />
    </>
  );
}
