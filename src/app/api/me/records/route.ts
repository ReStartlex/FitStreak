import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Personal records derived on-the-fly from ActivityRecord:
 *
 *   - per-exercise best single entry (max amount in one record)
 *   - per-exercise best single day (max sum of amount on a calendar day)
 *   - per-exercise lifetime totals
 *   - best Energy day (sum across all exercises)
 *
 * No new model needed; all numbers come from existing rows. Cached
 * privately for 30s so opening the dashboard a few times in a row
 * doesn't hammer the DB.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const userId = session.user.id;

    // Best single entry, per exercise.
    const bestSingle = await db.activityRecord.groupBy({
      by: ["exerciseId"],
      where: { userId },
      _max: { amount: true },
    });

    // Lifetime totals per exercise.
    const totals = await db.activityRecord.groupBy({
      by: ["exerciseId"],
      where: { userId },
      _sum: { amount: true, energy: true, kcal: true },
      _count: { _all: true },
    });

    // Best Energy in a single calendar day. Postgres-friendly raw aggregate
    // would need date_trunc, but Prisma aggregate suffices when we
    // reduce in JS — at the v1 scale we never have so many rows that
    // this is hot.
    const all = await db.activityRecord.findMany({
      where: { userId },
      select: {
        exerciseId: true,
        amount: true,
        energy: true,
        recordedAt: true,
      },
    });

    const byDayAll = new Map<string, number>();
    const byDayPerEx = new Map<string, Map<string, number>>();
    for (const r of all) {
      const k = r.recordedAt.toISOString().slice(0, 10);
      byDayAll.set(k, (byDayAll.get(k) ?? 0) + r.energy);
      let perEx = byDayPerEx.get(r.exerciseId);
      if (!perEx) {
        perEx = new Map();
        byDayPerEx.set(r.exerciseId, perEx);
      }
      perEx.set(k, (perEx.get(k) ?? 0) + r.amount);
    }
    let bestDay: { date: string; energy: number } | null = null;
    for (const [date, energy] of byDayAll.entries()) {
      if (!bestDay || energy > bestDay.energy) bestDay = { date, energy };
    }

    const exerciseRecords = totals.map((row) => {
      const perEx = byDayPerEx.get(row.exerciseId);
      let best = 0;
      let bestDate: string | null = null;
      if (perEx) {
        for (const [date, amount] of perEx.entries()) {
          if (amount > best) {
            best = amount;
            bestDate = date;
          }
        }
      }
      const single = bestSingle.find((s) => s.exerciseId === row.exerciseId);
      return {
        exerciseId: row.exerciseId,
        totalAmount: row._sum.amount ?? 0,
        totalEnergy: row._sum.energy ?? 0,
        totalKcal: row._sum.kcal ?? 0,
        recordsCount: row._count._all,
        bestSingleEntry: single?._max.amount ?? 0,
        bestDayAmount: best,
        bestDayDate: bestDate,
      };
    });

    return ok(
      {
        bestEnergyDay: bestDay,
        exercises: exerciseRecords.sort(
          (a, b) => b.totalEnergy - a.totalEnergy,
        ),
      },
      {
        headers: { "Cache-Control": "private, max-age=30" },
      },
    );
  } catch (error) {
    return serverError(error);
  }
}
