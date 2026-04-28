import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifyCron } from "@/lib/api/cron-auth";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily ranks/overtake digest. Runs once a day (see `vercel.json`).
 *
 * Two scopes — both deliberately conservative to avoid notification
 * spam:
 *
 *   1. **GLOBAL_STREAK top-3**: who has the longest current streak.
 *      Whoever drops out of top-3 receives `LEADERBOARD_OVERTAKE`;
 *      whoever joins it for the first time gets `LEADERBOARD_TOP3`.
 *
 *   2. **FRIENDS_TODAY**: per-observer ranking inside their own
 *      friends circle (self + people they follow), sorted by today's
 *      energy score. We compare today's circle ranking to yesterday's
 *      and emit a single collapsed `LEADERBOARD_OVERTAKE` per observer
 *      summarising who passed them. Observers with no followed users
 *      are skipped.
 *
 * Idempotent — if the cron triggers twice in a day, snapshots get
 * upserted in place and no extra notifications fire (collapse window
 * inside `createNotification` covers the second invocation).
 */
export async function POST(req: NextRequest) {
  return run(req);
}
export async function GET(req: NextRequest) {
  return run(req);
}

interface FriendCirclePosition {
  userId: string;
  rank: number;
  energy: number;
}

const TOP_N_GLOBAL = 3;

async function run(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const today = startOfDayUtc();
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  let globalNotifs = 0;
  let friendNotifs = 0;

  // ------------------------------------------------------------------
  // 1) GLOBAL_STREAK top-3
  // ------------------------------------------------------------------
  const topByStreak = await db.user.findMany({
    where: {
      currentStreak: { gt: 0 },
      isPublic: true,
      showOnLeaderboard: true,
    },
    orderBy: [{ currentStreak: "desc" }, { totalXp: "desc" }],
    take: TOP_N_GLOBAL,
    select: { id: true, currentStreak: true, name: true },
  });

  // Capture today's snapshot. Prisma's compound unique with a nullable
  // column ("observerId") doesn't accept null on the where side, so we
  // do a manual find-then-upsert.
  for (let i = 0; i < topByStreak.length; i += 1) {
    const u = topByStreak[i];
    const existing = await db.rankSnapshot.findFirst({
      where: {
        scope: "GLOBAL_STREAK",
        observerId: null,
        userId: u.id,
        capturedOn: today,
      },
      select: { id: true },
    });
    if (existing) {
      await db.rankSnapshot.update({
        where: { id: existing.id },
        data: { rank: i + 1, value: u.currentStreak },
      });
    } else {
      await db.rankSnapshot.create({
        data: {
          scope: "GLOBAL_STREAK",
          observerId: null,
          userId: u.id,
          rank: i + 1,
          value: u.currentStreak,
          capturedOn: today,
        },
      });
    }
  }

  // Compare with yesterday: anyone who was in top-3 yesterday but not
  // today gets `LEADERBOARD_OVERTAKE`; new entrants get `TOP3`.
  const yesterdayTop = await db.rankSnapshot.findMany({
    where: {
      scope: "GLOBAL_STREAK",
      observerId: null,
      capturedOn: yesterday,
    },
    select: { userId: true, rank: true, value: true },
  });
  const yesterdayIds = new Set(yesterdayTop.map((s) => s.userId));
  const todayIds = new Set(topByStreak.map((u) => u.id));

  // Whoever fell out of top-3:
  for (const prev of yesterdayTop) {
    if (!todayIds.has(prev.userId)) {
      await createNotification({
        userId: prev.userId,
        actorId: topByStreak[0]?.id ?? null,
        type: "LEADERBOARD_OVERTAKE",
        data: {
          scope: "global_streak",
          previousRank: prev.rank,
          newTopUser: topByStreak[0]?.name ?? null,
          newTopStreak: topByStreak[0]?.currentStreak ?? null,
        },
        collapseRecentMs: 24 * 60 * 60 * 1000,
      });
      globalNotifs += 1;
    }
  }
  // Whoever joined top-3 for the first time today:
  for (const u of topByStreak) {
    if (!yesterdayIds.has(u.id)) {
      await createNotification({
        userId: u.id,
        type: "LEADERBOARD_TOP3",
        data: {
          scope: "global_streak",
          rank: topByStreak.findIndex((x) => x.id === u.id) + 1,
          streak: u.currentStreak,
        },
        collapseRecentMs: 24 * 60 * 60 * 1000,
      });
      globalNotifs += 1;
    }
  }

  // ------------------------------------------------------------------
  // 2) FRIENDS_TODAY (self + follows by today's energy)
  // ------------------------------------------------------------------
  // Pull all follow rows up front and bucket them per observer; cheap
  // even at v1 scale.
  const follows = await db.follow.findMany({
    select: { followerId: true, followingId: true },
  });
  const observerToFollowed = new Map<string, Set<string>>();
  for (const f of follows) {
    let set = observerToFollowed.get(f.followerId);
    if (!set) {
      set = new Set();
      observerToFollowed.set(f.followerId, set);
    }
    set.add(f.followingId);
  }

  // Today's energies for everyone who logged anything today (cheap
  // single aggregate). Users who didn't log today have implicit zero.
  const energyAgg = await db.activityRecord.groupBy({
    by: ["userId"],
    where: { recordedAt: { gte: today } },
    _sum: { energy: true },
  });
  const todayEnergyByUser = new Map<string, number>();
  for (const row of energyAgg) {
    todayEnergyByUser.set(row.userId, row._sum.energy ?? 0);
  }

  // Yesterday's friend snapshots — one query, group by observer.
  const yesterdayFriends = await db.rankSnapshot.findMany({
    where: { scope: "FRIENDS_TODAY", capturedOn: yesterday },
    select: { observerId: true, userId: true, rank: true },
  });
  const yesterdayByObserver = new Map<
    string,
    Map<string, number>
  >();
  for (const s of yesterdayFriends) {
    if (!s.observerId) continue;
    let inner = yesterdayByObserver.get(s.observerId);
    if (!inner) {
      inner = new Map();
      yesterdayByObserver.set(s.observerId, inner);
    }
    inner.set(s.userId, s.rank);
  }

  // Process each observer.
  for (const [observerId, followedSet] of observerToFollowed.entries()) {
    if (followedSet.size === 0) continue;

    // The circle = me + people I follow.
    const circle: FriendCirclePosition[] = [];
    const myEnergy = todayEnergyByUser.get(observerId) ?? 0;
    circle.push({ userId: observerId, rank: 0, energy: myEnergy });
    for (const fid of followedSet) {
      circle.push({
        userId: fid,
        rank: 0,
        energy: todayEnergyByUser.get(fid) ?? 0,
      });
    }
    // Sort descending by today's energy.
    circle.sort((a, b) => b.energy - a.energy);
    circle.forEach((c, i) => (c.rank = i + 1));

    // Snapshot today's circle ranks.
    for (const c of circle) {
      await db.rankSnapshot.upsert({
        where: {
          scope_observerId_userId_capturedOn: {
            scope: "FRIENDS_TODAY",
            observerId,
            userId: c.userId,
            capturedOn: today,
          },
        },
        create: {
          scope: "FRIENDS_TODAY",
          observerId,
          userId: c.userId,
          rank: c.rank,
          value: c.energy,
          capturedOn: today,
        },
        update: { rank: c.rank, value: c.energy },
      });
    }

    // Find friends who passed me today vs yesterday.
    const me = circle.find((c) => c.userId === observerId);
    if (!me) continue;
    const yesterdayRanks = yesterdayByObserver.get(observerId);
    if (!yesterdayRanks) continue; // no baseline → don't fire
    const myYesterdayRank = yesterdayRanks.get(observerId);
    if (myYesterdayRank == null) continue;

    const passers: Array<{ userId: string; oldRank: number; newRank: number }> = [];
    for (const c of circle) {
      if (c.userId === observerId) continue;
      const cYesterday = yesterdayRanks.get(c.userId);
      if (cYesterday == null) continue;
      // They were behind me yesterday and ahead of me today.
      if (cYesterday > myYesterdayRank && c.rank < me.rank) {
        passers.push({
          userId: c.userId,
          oldRank: cYesterday,
          newRank: c.rank,
        });
      }
    }
    if (passers.length === 0) continue;

    // Pick the top passer (closest to me) as the "actor" so the
    // notification has a face. Other passers go in `data.others`.
    const lead = passers[0];
    await createNotification({
      userId: observerId,
      actorId: lead.userId,
      type: "LEADERBOARD_OVERTAKE",
      data: {
        scope: "friends_today",
        passers: passers.length,
        myRank: me.rank,
        myYesterdayRank,
        leadUserId: lead.userId,
      },
      collapseRecentMs: 24 * 60 * 60 * 1000,
    });
    friendNotifs += 1;
  }

  return NextResponse.json({
    ok: true,
    today: today.toISOString().slice(0, 10),
    globalNotifs,
    friendNotifs,
    observersChecked: observerToFollowed.size,
  });
}

function startOfDayUtc(): Date {
  const d = new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}
