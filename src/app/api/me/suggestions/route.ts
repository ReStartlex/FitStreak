import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorized, serverError } from "@/lib/api/response";
import { getBlockedSets } from "@/lib/api/blocks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Suggestion {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  level: number;
  currentStreak: number;
  /** Mutual followers count (best-of-friends reason). */
  mutual: number;
  reason: "MUTUAL" | "SAME_LEVEL" | "POPULAR";
}

/**
 * GET /api/me/suggestions — returns up to 8 people the current user
 * might want to follow, ranked by:
 *
 *  1. Mutual friends (people my friends follow but I don't).
 *  2. Same-level neighbours (±5 levels) with a healthy streak.
 *  3. Popular users (highest current streak) as a fallback so even
 *     fresh accounts see something.
 *
 * The endpoint is per-user and filtered by blocks; it's safe to cache
 * at the edge for short periods.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const me = session.user.id;

    const [meRow, blocks, following] = await Promise.all([
      db.user.findUnique({
        where: { id: me },
        select: { level: true, isPublic: true },
      }),
      getBlockedSets(me),
      db.follow.findMany({
        where: { followerId: me },
        select: { followingId: true },
      }),
    ]);
    if (!meRow) return unauthorized();

    const followingIds = new Set(following.map((f) => f.followingId));
    const exclude = new Set<string>([me, ...followingIds, ...blocks.any]);

    const limit = 8;

    // ---- pass 1: mutual friends ------------------------------------
    // For users I follow, who do *they* follow that I don't?
    const mutualPool =
      followingIds.size > 0
        ? await db.follow.groupBy({
            by: ["followingId"],
            where: {
              followerId: { in: Array.from(followingIds) },
              followingId: { notIn: Array.from(exclude) },
            },
            _count: { followingId: true },
            orderBy: { _count: { followingId: "desc" } },
            take: limit * 2,
          })
        : [];

    const mutualIds = mutualPool.map((r) => r.followingId);
    const mutualUsers = mutualIds.length
      ? await db.user.findMany({
          where: {
            id: { in: mutualIds },
            isPublic: true,
          },
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
            currentStreak: true,
          },
        })
      : [];
    const mutualMap = new Map(mutualUsers.map((u) => [u.id, u]));

    const out: Suggestion[] = [];
    for (const row of mutualPool) {
      const u = mutualMap.get(row.followingId);
      if (!u) continue;
      out.push({
        ...u,
        mutual: row._count.followingId,
        reason: "MUTUAL",
      });
      if (out.length >= limit) break;
    }

    // ---- pass 2: same-level neighbours ----------------------------
    if (out.length < limit) {
      const taken = new Set(out.map((u) => u.id));
      const allExclude = new Set([...exclude, ...taken]);
      const neighbours = await db.user.findMany({
        where: {
          id: { notIn: Array.from(allExclude) },
          isPublic: true,
          level: { gte: Math.max(1, meRow.level - 5), lte: meRow.level + 5 },
          currentStreak: { gt: 0 },
        },
        orderBy: [{ currentStreak: "desc" }, { totalXp: "desc" }],
        take: limit - out.length,
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          level: true,
          currentStreak: true,
        },
      });
      for (const u of neighbours) {
        out.push({ ...u, mutual: 0, reason: "SAME_LEVEL" });
      }
    }

    // ---- pass 3: popular fallback ---------------------------------
    if (out.length < limit) {
      const taken = new Set(out.map((u) => u.id));
      const allExclude = new Set([...exclude, ...taken]);
      const popular = await db.user.findMany({
        where: {
          id: { notIn: Array.from(allExclude) },
          isPublic: true,
          currentStreak: { gt: 0 },
        },
        orderBy: { currentStreak: "desc" },
        take: limit - out.length,
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          level: true,
          currentStreak: true,
        },
      });
      for (const u of popular) {
        out.push({ ...u, mutual: 0, reason: "POPULAR" });
      }
    }

    return NextResponse.json(
      { suggestions: out },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
          Vary: "Cookie",
        },
      },
    );
  } catch (error) {
    return serverError(error);
  }
}
