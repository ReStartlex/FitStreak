import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api/response";
import { calcDailyGoal } from "@/lib/goals";
import { getLevelInfo } from "@/lib/leveling";

export const runtime = "nodejs";
// Always render on-demand because the response varies per signed-in user
// (the `me.todayAmount` block reads cookies via auth()). Public callers
// still benefit from the s-maxage=60 Cache-Control header below.
export const dynamic = "force-dynamic";

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfYesterday(): Date {
  const today = startOfToday();
  return new Date(today.getTime() - 24 * 60 * 60_000);
}

/**
 * Real, public-safe community statistics for the landing page:
 *
 *  - per-exercise totals (today),
 *  - 24-hour percentage delta vs the same window yesterday,
 *  - global total of reps logged today,
 *  - lifetime total Energy Score across all users (cheap aggregate),
 *  - active community size (users with any activity in the last 30 days),
 *  - the requesting user's own contribution today (if signed in).
 *
 * No personally identifiable data leaks — we only emit aggregates.
 */
export async function GET() {
  try {
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60_000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60_000);

    const session = await auth();
    const myId = session?.user?.id ?? null;

    const [
      todayPerExercise,
      yestPerExercise,
      todayTotalsAll,
      lifetimeAgg,
      activeCount,
      myTodayAgg,
      myUser,
    ] = await Promise.all([
      db.activityRecord.groupBy({
        by: ["exerciseId"],
        where: { recordedAt: { gte: today } },
        _sum: { amount: true, energy: true, kcal: true },
      }),
      db.activityRecord.groupBy({
        by: ["exerciseId"],
        where: { recordedAt: { gte: yesterday, lt: tomorrow } },
        _sum: { amount: true },
      }),
      db.activityRecord.aggregate({
        where: { recordedAt: { gte: today } },
        _sum: { amount: true, energy: true, kcal: true },
        _count: { _all: true },
      }),
      db.user.aggregate({
        _sum: { totalEnergy: true },
      }),
      db.user.count({
        where: { lastActiveAt: { gte: thirtyDaysAgo } },
      }),
      myId
        ? db.activityRecord.aggregate({
            where: { userId: myId, recordedAt: { gte: today } },
            _sum: { amount: true, energy: true, kcal: true },
          })
        : Promise.resolve(null),
      myId
        ? db.user.findUnique({
            where: { id: myId },
            select: {
              name: true,
              username: true,
              image: true,
              currentStreak: true,
              bestStreak: true,
              level: true,
              totalXp: true,
              fitnessLevel: true,
              age: true,
              gender: true,
              goal: true,
              weightKg: true,
            },
          })
        : Promise.resolve(null),
    ]);

    // Note: `yestPerExercise` actually covers a 48h window because we set
    // gte=yesterday AND lt=tomorrow. We subtract today's count from it to
    // get the actual yesterday-only number for the delta calculation.
    const todayMap = new Map<string, number>();
    for (const row of todayPerExercise) {
      todayMap.set(row.exerciseId, row._sum.amount ?? 0);
    }
    const perExercise = todayPerExercise
      .map((row) => {
        const todayAmount = row._sum.amount ?? 0;
        const window48h = yestPerExercise.find(
          (y) => y.exerciseId === row.exerciseId,
        );
        const yesterdayOnly = Math.max(
          0,
          (window48h?._sum.amount ?? 0) - todayAmount,
        );
        const delta =
          yesterdayOnly > 0
            ? Math.round(
                ((todayAmount - yesterdayOnly) / yesterdayOnly) * 100,
              )
            : todayAmount > 0
              ? 100
              : 0;
        return {
          exerciseId: row.exerciseId,
          amount: todayAmount,
          energy: row._sum.energy ?? 0,
          kcal: row._sum.kcal ?? 0,
          deltaPct: delta,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return ok(
      {
        today: {
          totalAmount: todayTotalsAll._sum.amount ?? 0,
          totalEnergy: todayTotalsAll._sum.energy ?? 0,
          totalKcal: todayTotalsAll._sum.kcal ?? 0,
          logsCount: todayTotalsAll._count._all,
          perExercise,
        },
        lifetime: {
          totalEnergy: lifetimeAgg._sum.totalEnergy ?? 0,
        },
        community: {
          activeUsers30d: activeCount,
        },
        me: myId && myUser
          ? {
              name: myUser.name,
              username: myUser.username,
              image: myUser.image,
              level: myUser.level,
              currentStreak: myUser.currentStreak,
              bestStreak: myUser.bestStreak,
              levelProgressPct: Math.round(
                getLevelInfo(myUser.totalXp).progress,
              ),
              dailyGoal: calcDailyGoal({
                fitnessLevel: myUser.fitnessLevel,
                age: myUser.age,
                gender: myUser.gender,
                goal: myUser.goal,
                weightKg: myUser.weightKg,
              }),
              todayAmount: myTodayAgg?._sum.amount ?? 0,
              todayEnergy: myTodayAgg?._sum.energy ?? 0,
              todayKcal: myTodayAgg?._sum.kcal ?? 0,
            }
          : null,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          // The response carries `me` derived from the auth cookie, so
          // it MUST NOT live in a shared CDN cache (otherwise user A's
          // data would leak to user B). Browser-private cache is fine
          // for ~15s — the hook also re-fetches on focus/visibility.
          "Cache-Control": "private, max-age=15",
          Vary: "Cookie",
        },
      },
    );
  } catch (error) {
    return serverError(error);
  }
}
