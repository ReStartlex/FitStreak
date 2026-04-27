import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  tooMany,
  unauthorized,
  serverError,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import {
  getTodayTotals,
  startOfToday,
} from "@/lib/api/activity-service";
import { getLevelInfo } from "@/lib/leveling";
import { getDivision, getTierTheme } from "@/lib/ranks";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const userId = session.user.id;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return unauthorized();

    const today = startOfToday();
    const todayTotals = await getTodayTotals(userId);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekAgg = await db.activityRecord.aggregate({
      where: { userId, recordedAt: { gte: weekStart } },
      _sum: { energy: true, xp: true, kcal: true },
    });

    const level = getLevelInfo(user.totalXp);
    const division = getDivision(level.level);
    const tier = getTierTheme(division.tier);

    let energyRank: number | null = null;
    try {
      const higher = await db.user.count({
        where: { totalEnergy: { gt: user.totalEnergy } },
      });
      energyRank = higher + 1;
    } catch {
      energyRank = null;
    }

    return ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image,
        locale: user.locale,
        plan: user.plan,
        onboarded: user.onboarded,
        gender: user.gender,
        age: user.age,
        heightCm: user.heightCm,
        weightKg: user.weightKg,
        fitnessLevel: user.fitnessLevel,
        goal: user.goal,
        totalEnergy: user.totalEnergy,
        totalXp: user.totalXp,
        level: user.level,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
      },
      today: todayTotals,
      week: {
        energy: weekAgg._sum.energy ?? 0,
        xp: weekAgg._sum.xp ?? 0,
        kcal: weekAgg._sum.kcal ?? 0,
      },
      level,
      division,
      tier,
      energyRank,
    });
  } catch (error) {
    return serverError(error);
  }
}

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_.-]+$/i).optional(),
  locale: z.enum(["ru", "en"]).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`me:${session.user.id ?? clientId(request)}`, 30, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

    if (parsed.data.username) {
      const exists = await db.user.findFirst({
        where: { username: parsed.data.username, NOT: { id: session.user.id } },
        select: { id: true },
      });
      if (exists) return badRequest("USERNAME_TAKEN");
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { id: true, name: true, username: true, locale: true },
    });

    return ok({ user: updated });
  } catch (error) {
    return serverError(error);
  }
}
