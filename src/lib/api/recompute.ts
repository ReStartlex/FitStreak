import { db } from "@/lib/db";
import { getLevelInfo } from "@/lib/leveling";

/**
 * Re-derives the cached aggregates we keep on the User row from raw
 * `ActivityRecord` rows. Used after delete/edit operations so totals,
 * level and streak stay honest.
 *
 * Notes:
 *   - `bestStreak` is not lowered here — historic best is preserved.
 *   - Spent `streakFreezes` are not refunded; they're part of history.
 *   - Streak is computed as consecutive days ending at today (or
 *     yesterday — we still count the streak as alive even when the
 *     user hasn't logged today yet).
 */
export async function recomputeUserAggregates(userId: string) {
  const records = await db.activityRecord.findMany({
    where: { userId },
    select: { energy: true, xp: true, recordedAt: true },
    orderBy: { recordedAt: "desc" },
  });

  let totalEnergy = 0;
  let totalXp = 0;
  for (const r of records) {
    totalEnergy += r.energy;
    totalXp += r.xp;
  }

  const lastActiveAt =
    records.length > 0 ? records[0].recordedAt : null;
  const newLevel = getLevelInfo(totalXp).level;

  // ---- streak ----
  const dayKeys = Array.from(
    new Set(records.map((r) => isoDay(r.recordedAt))),
  ).sort((a, b) => (a < b ? 1 : -1)); // desc

  const todayKey = isoDay(new Date());
  const yesterdayKey = isoDay(addDays(new Date(), -1));

  let streak = 0;
  if (dayKeys.length > 0) {
    const head = dayKeys[0];
    if (head === todayKey || head === yesterdayKey) {
      streak = 1;
      for (let i = 1; i < dayKeys.length; i += 1) {
        const prev = parseDay(dayKeys[i - 1]);
        const curr = parseDay(dayKeys[i]);
        const gapDays = Math.round(
          (prev.getTime() - curr.getTime()) / 86_400_000,
        );
        if (gapDays === 1) {
          streak += 1;
        } else {
          break;
        }
      }
    }
  }

  // We never lower bestStreak — protect historic milestones.
  const current = await db.user.findUnique({
    where: { id: userId },
    select: { bestStreak: true },
  });
  const bestStreak = Math.max(current?.bestStreak ?? 0, streak);

  await db.user.update({
    where: { id: userId },
    data: {
      totalEnergy,
      totalXp,
      level: newLevel,
      lastActiveAt,
      currentStreak: streak,
      bestStreak,
    },
  });

  return {
    totalEnergy,
    totalXp,
    level: newLevel,
    currentStreak: streak,
    bestStreak,
  };
}

function isoDay(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  // Use YYYY-MM-DD in the user's local time. The activity timestamps
  // are stored as UTC instants but the streak is a *calendar* concept.
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map((s) => Number(s));
  return new Date(y, m - 1, d);
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}
