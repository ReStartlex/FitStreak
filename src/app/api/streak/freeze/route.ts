import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, unauthorized, badRequest, serverError } from "@/lib/api/response";

export const runtime = "nodejs";

/**
 * GET /api/streak/freeze
 *
 * Returns the user's current freeze balance and last-used timestamp.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        streakFreezes: true,
        lastFreezeUsedAt: true,
        freezesEarnedTotal: true,
        currentStreak: true,
        bestStreak: true,
      },
    });
    if (!user) return unauthorized();
    return ok(user);
  } catch (error) {
    return serverError(error);
  }
}

/**
 * POST /api/streak/freeze
 *
 * Manually consumes one freeze and shifts `lastActiveAt` to today,
 * so the gap-detection in /api/activity treats today as already
 * "kept". Useful when the user knows they won't move today and
 * wants to lock in the protection in advance.
 *
 * Idempotent within the same UTC day (won't consume twice).
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        streakFreezes: true,
        lastFreezeUsedAt: true,
        currentStreak: true,
        lastActiveAt: true,
      },
    });
    if (!user) return unauthorized();

    if (user.streakFreezes <= 0) {
      return badRequest("No freezes available");
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Already used today — no double-spend.
    if (user.lastFreezeUsedAt && user.lastFreezeUsedAt >= todayStart) {
      return ok({
        consumed: false,
        already: true,
        streakFreezes: user.streakFreezes,
      });
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        streakFreezes: user.streakFreezes - 1,
        lastFreezeUsedAt: now,
        lastActiveAt: now,
      },
      select: {
        streakFreezes: true,
        currentStreak: true,
        lastFreezeUsedAt: true,
      },
    });

    return ok({ consumed: true, ...updated });
  } catch (error) {
    return serverError(error);
  }
}
