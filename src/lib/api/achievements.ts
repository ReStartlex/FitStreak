/**
 * Achievement granting & evaluation.
 *
 * `grantAchievement` upserts a UserAchievement row, increments the
 * per-user count, and adds the configured reward XP back to the
 * user's totalXp. `evaluateAchievementsAfterActivity` is called after
 * every successful activity log to detect newly-met conditions
 * (streak milestones, lifetime exercise totals, level milestones).
 *
 * The function is intentionally cheap: it only queries when the
 * relevant signal could possibly trigger something new.
 */

import { db } from "@/lib/db";

export interface GrantedAchievement {
  slug: string;
  titleRu: string;
  titleEn: string;
  icon: string;
  tier: string;
  rewardXp: number;
  count: number;
  isNew: boolean;
}

/**
 * Idempotent grant. If the user has already earned this achievement, the
 * count increments and lastEarnedAt updates, but reward XP is NOT
 * granted again to avoid farming. Returns null if achievement slug
 * doesn't exist.
 */
export async function grantAchievement(
  userId: string,
  slug: string,
): Promise<GrantedAchievement | null> {
  const ach = await db.achievement.findUnique({ where: { slug } });
  if (!ach) return null;

  const existing = await db.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId: ach.id },
    },
  });

  if (existing) {
    const updated = await db.userAchievement.update({
      where: { id: existing.id },
      data: {
        count: { increment: 1 },
        lastEarnedAt: new Date(),
      },
    });
    return {
      slug: ach.slug,
      titleRu: ach.titleRu,
      titleEn: ach.titleEn,
      icon: ach.icon,
      tier: ach.tier,
      rewardXp: 0,
      count: updated.count,
      isNew: false,
    };
  }

  const [, _userBump] = await db.$transaction([
    db.userAchievement.create({
      data: {
        userId,
        achievementId: ach.id,
        count: 1,
        unlockedAt: new Date(),
        lastEarnedAt: new Date(),
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { totalXp: { increment: ach.rewardXp } },
    }),
  ]);

  return {
    slug: ach.slug,
    titleRu: ach.titleRu,
    titleEn: ach.titleEn,
    icon: ach.icon,
    tier: ach.tier,
    rewardXp: ach.rewardXp,
    count: 1,
    isNew: true,
  };
}

interface ActivitySignal {
  userId: string;
  exerciseId: string;
  amountToday: number;
  totalAmountForExercise: number;
  newStreak: number;
  newLevel: number;
  previousLevel: number;
}

const STREAK_MILESTONES = [
  { streak: 7, slug: "streak-7" },
  { streak: 14, slug: "streak-14" },
  { streak: 30, slug: "streak-30" },
  { streak: 100, slug: "streak-100" },
];

const LEVEL_MILESTONES = [
  { level: 25, slug: "level-25" },
  { level: 50, slug: "level-50" },
];

/**
 * After a successful activity log, evaluate which achievements should
 * be granted. Granted achievements (incl. repeats) are returned to
 * surface in the UI.
 */
export async function evaluateAchievementsAfterActivity(
  signal: ActivitySignal,
): Promise<GrantedAchievement[]> {
  const granted: GrantedAchievement[] = [];

  // First-ever activity — grant once.
  // Heuristic: if total amount for this exercise equals the just-logged
  // amount, this could be the user's first interaction with anything;
  // simpler just attempt to grant — duplicates are handled.
  const firstWorkout = await grantFirstWorkout(signal.userId);
  if (firstWorkout) granted.push(firstWorkout);

  // Streak milestones.
  for (const m of STREAK_MILESTONES) {
    if (signal.newStreak === m.streak) {
      const result = await grantAchievement(signal.userId, m.slug);
      if (result) granted.push(result);
    }
  }

  // Level milestones (only when a new level was reached).
  for (const m of LEVEL_MILESTONES) {
    if (signal.previousLevel < m.level && signal.newLevel >= m.level) {
      const result = await grantAchievement(signal.userId, m.slug);
      if (result) granted.push(result);
    }
  }

  // Per-exercise lifetime totals.
  if (
    signal.exerciseId === "pushups" &&
    signal.totalAmountForExercise >= 100 &&
    signal.totalAmountForExercise - signal.amountToday < 100
  ) {
    const result = await grantAchievement(signal.userId, "100-pushups");
    if (result) granted.push(result);
  }

  return granted;
}

async function grantFirstWorkout(userId: string): Promise<GrantedAchievement | null> {
  const ach = await db.achievement.findUnique({ where: { slug: "first-workout" } });
  if (!ach) return null;
  const has = await db.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: ach.id } },
  });
  if (has) return null;
  return grantAchievement(userId, "first-workout");
}
