import type { User } from "@prisma/client";

import { db } from "@/lib/db";
import { calcEnergyScore, calcXP, calcKcal } from "@/lib/scoring";
import { getLevelInfo } from "@/lib/leveling";
import type { BodyMetrics } from "@/lib/mock/user";
import { validateAmount } from "./anti-cheat";
import {
  evaluateAchievementsAfterActivity,
  type GrantedAchievement,
} from "./achievements";

export function userToBodyMetrics(
  user: Pick<User, "gender" | "age" | "heightCm" | "weightKg">,
): BodyMetrics | undefined {
  if (!user.heightCm || !user.weightKg) return undefined;
  return {
    gender:
      user.gender === "MALE"
        ? "male"
        : user.gender === "FEMALE"
          ? "female"
          : "other",
    age: user.age ?? 25,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
  };
}

export function startOfToday(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfYesterday(date = new Date()): Date {
  const d = startOfToday(date);
  d.setDate(d.getDate() - 1);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface LogActivityResult {
  ok: true;
  record: {
    id: string;
    exerciseId: string;
    amount: number;
    energy: number;
    xp: number;
    kcal: number;
    recordedAt: Date;
  };
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
    streakFreezes: number;
    /** True when an auto-freeze was consumed in this log call. */
    freezeUsed: boolean;
  };
  /** Achievements granted (or re-earned) by this single activity. */
  achievements: GrantedAchievement[];
}

export interface LogActivityError {
  ok: false;
  reason: "INVALID_EXERCISE" | "AMOUNT_TOO_LOW" | "AMOUNT_TOO_HIGH" | "DAILY_CAP";
  message: string;
}

export async function logActivity(
  userId: string,
  exerciseId: string,
  amount: number,
): Promise<LogActivityResult | LogActivityError> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, reason: "INVALID_EXERCISE", message: "User not found" };
  }

  const today = startOfToday();
  const todayAgg = await db.activityRecord.aggregate({
    where: { userId, exerciseId, recordedAt: { gte: today } },
    _sum: { amount: true },
  });
  const amountToday = todayAgg._sum.amount ?? 0;

  const validation = validateAmount(exerciseId, amount, amountToday);
  if (!validation.ok) {
    return {
      ok: false,
      reason: validation.reason!,
      message:
        validation.reason === "DAILY_CAP"
          ? "You hit the daily safety cap for this exercise"
          : validation.reason === "AMOUNT_TOO_HIGH"
            ? "Single entry too large"
            : validation.reason === "AMOUNT_TOO_LOW"
              ? "Amount must be positive"
              : "Unknown exercise",
    };
  }

  const metrics = userToBodyMetrics(user);
  const energy = calcEnergyScore(exerciseId, amount);
  const xp = calcXP(exerciseId, amount);
  const kcal = calcKcal(exerciseId, amount, metrics);

  const previousLevel = user.level;

  const totalsBeforeToday = await db.activityRecord.aggregate({
    where: { userId, recordedAt: { gte: today } },
    _sum: { energy: true, xp: true, kcal: true },
  });

  const lastActive = user.lastActiveAt ?? null;
  let nextStreak = user.currentStreak;
  let freezeUsed = false;
  let nextStreakFreezes = user.streakFreezes;

  if (!lastActive) {
    nextStreak = 1;
  } else if (sameDay(lastActive, new Date())) {
    // Already logged today — streak unchanged.
    nextStreak = Math.max(1, user.currentStreak);
  } else if (sameDay(lastActive, startOfYesterday(new Date()))) {
    // Logged yesterday — straight increment.
    nextStreak = user.currentStreak + 1;
  } else {
    // Gap of one or more missed days — try to spend exactly ONE freeze
    // to bridge a 1-day gap (the user missed yesterday but is back today).
    const yesterday = startOfYesterday(new Date());
    const dayBeforeYesterday = startOfYesterday(yesterday);
    const onlyOneMissed = sameDay(lastActive, dayBeforeYesterday);
    if (onlyOneMissed && user.streakFreezes > 0 && user.currentStreak > 0) {
      nextStreak = user.currentStreak + 1;
      nextStreakFreezes = user.streakFreezes - 1;
      freezeUsed = true;
    } else {
      nextStreak = 1;
    }
  }

  const newTotalXp = user.totalXp + xp;
  const newTotalEnergy = user.totalEnergy + energy;
  const newLevel = getLevelInfo(newTotalXp).level;

  // Reward: +1 freeze per level gained, capped at 5 total (free tier).
  const levelsGained = Math.max(0, newLevel - user.level);
  const FREEZE_CAP = 5;
  const earnedFreezes = Math.min(
    levelsGained,
    Math.max(0, FREEZE_CAP - nextStreakFreezes),
  );
  if (earnedFreezes > 0) {
    nextStreakFreezes += earnedFreezes;
  }

  const [record, updatedUser] = await db.$transaction([
    db.activityRecord.create({
      data: {
        userId,
        exerciseId,
        amount,
        energy,
        xp,
        kcal,
      },
      select: {
        id: true,
        exerciseId: true,
        amount: true,
        energy: true,
        xp: true,
        kcal: true,
        recordedAt: true,
      },
    }),
    db.user.update({
      where: { id: userId },
      data: {
        totalEnergy: newTotalEnergy,
        totalXp: newTotalXp,
        level: newLevel,
        currentStreak: nextStreak,
        bestStreak: Math.max(user.bestStreak, nextStreak),
        lastActiveAt: new Date(),
        streakFreezes: nextStreakFreezes,
        ...(freezeUsed ? { lastFreezeUsedAt: new Date() } : {}),
        ...(earnedFreezes > 0
          ? { freezesEarnedTotal: user.freezesEarnedTotal + earnedFreezes }
          : {}),
      },
      select: {
        totalEnergy: true,
        totalXp: true,
        level: true,
        currentStreak: true,
        bestStreak: true,
        streakFreezes: true,
      },
    }),
  ]);

  const todayEnergy = (totalsBeforeToday._sum.energy ?? 0) + energy;
  const todayXp = (totalsBeforeToday._sum.xp ?? 0) + xp;
  const todayKcal = (totalsBeforeToday._sum.kcal ?? 0) + kcal;

  // Evaluate achievement triggers (lifetime totals, streak milestones,
  // level milestones). Reward XP is automatically deposited inside.
  const exerciseAgg = await db.activityRecord.aggregate({
    where: { userId, exerciseId },
    _sum: { amount: true },
  });
  const totalAmountForExercise = exerciseAgg._sum.amount ?? amount;

  const achievements = await evaluateAchievementsAfterActivity({
    userId,
    exerciseId,
    amountToday: amount + amountToday,
    totalAmountForExercise,
    newStreak: updatedUser.currentStreak,
    newLevel: updatedUser.level,
    previousLevel,
  });

  // Achievement reward XP may have changed totalXp; refresh once.
  let finalTotalXp = updatedUser.totalXp;
  let finalLevel = updatedUser.level;
  if (achievements.some((a) => a.isNew && a.rewardXp > 0)) {
    const refreshed = await db.user.findUnique({
      where: { id: userId },
      select: { totalXp: true, level: true },
    });
    if (refreshed) {
      finalTotalXp = refreshed.totalXp;
      const lvl = getLevelInfo(refreshed.totalXp).level;
      if (lvl !== refreshed.level) {
        await db.user.update({
          where: { id: userId },
          data: { level: lvl },
        });
        finalLevel = lvl;
      } else {
        finalLevel = refreshed.level;
      }
    }
  }

  return {
    ok: true,
    record,
    totals: {
      todayEnergy,
      todayXp,
      todayKcal,
      totalEnergy: updatedUser.totalEnergy,
      totalXp: finalTotalXp,
      level: finalLevel,
      levelUp: finalLevel > previousLevel,
      currentStreak: updatedUser.currentStreak,
      bestStreak: updatedUser.bestStreak,
      streakFreezes: updatedUser.streakFreezes,
      freezeUsed,
    },
    achievements,
  };
}

export async function getTodayTotals(userId: string) {
  const today = startOfToday();
  const aggregate = await db.activityRecord.aggregate({
    where: { userId, recordedAt: { gte: today } },
    _sum: { energy: true, xp: true, kcal: true, amount: true },
  });
  return {
    energy: aggregate._sum.energy ?? 0,
    xp: aggregate._sum.xp ?? 0,
    kcal: aggregate._sum.kcal ?? 0,
    amount: aggregate._sum.amount ?? 0,
  };
}
