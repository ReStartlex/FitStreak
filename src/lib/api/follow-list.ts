import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, notFound, serverError } from "@/lib/api/response";
import { getBlockedSets } from "@/lib/api/blocks";

const PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;

/**
 * Cursor-paginated list of a user's followers or followees, used by
 * `/u/[username]/followers` and `/following`. The cursor is the
 * underlying Follow row id — stable, monotonically older.
 */
export async function listFollowEdges(
  kind: "followers" | "following",
  request: NextRequest,
  username: string,
) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(url.searchParams.get("limit") ?? PAGE_SIZE)),
    );
    const cursor = url.searchParams.get("cursor");

    const session = await auth();
    const me = session?.user?.id ?? null;

    const target = await db.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true, isPublic: true },
    });
    if (!target) return notFound("User not found");
    if (!target.isPublic && me !== target.id)
      return notFound("User not found");

    const blocks = await getBlockedSets(me);
    if (me && me !== target.id && blocks.any.has(target.id)) {
      return notFound("User not found");
    }

    if (kind === "followers") {
      const rows = await db.follow.findMany({
        where: {
          followingId: target.id,
          ...(blocks.any.size > 0
            ? { followerId: { notIn: Array.from(blocks.any) } }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              level: true,
              currentStreak: true,
            },
          },
        },
      });
      return paginateOk(rows, limit, (r) => r.follower);
    }

    const rows = await db.follow.findMany({
      where: {
        followerId: target.id,
        ...(blocks.any.size > 0
          ? { followingId: { notIn: Array.from(blocks.any) } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: true,
            currentStreak: true,
          },
        },
      },
    });
    return paginateOk(rows, limit, (r) => r.following);
  } catch (error) {
    return serverError(error);
  }
}

interface FollowRowLike {
  id: string;
}

interface FollowUserSlice {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  level: number;
  currentStreak: number;
}

function paginateOk<T extends FollowRowLike>(
  rows: T[],
  limit: number,
  pick: (row: T) => FollowUserSlice,
) {
  const hasMore = rows.length > limit;
  const visible = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore
    ? visible[visible.length - 1]?.id ?? null
    : null;
  return ok({
    users: visible.map((r) => {
      const u = pick(r);
      return {
        id: u.id,
        name: u.name ?? u.username ?? "Athlete",
        username: u.username,
        image: u.image,
        level: u.level,
        currentStreak: u.currentStreak,
      };
    }),
    nextCursor,
    hasMore,
  });
}
