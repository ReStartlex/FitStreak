import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  serverError,
} from "@/lib/api/response";
import { startOfToday } from "@/lib/api/activity-service";
import { getDivision } from "@/lib/ranks";

export const runtime = "nodejs";

const querySchema = z.object({
  metric: z.enum(["energy", "level", "xp"]).default("energy"),
  range: z.enum(["day", "week", "all"]).default("day"),
  scope: z
    .enum(["global", "friends", "men", "women", "age", "fitness"])
    .default("global"),
  limit: z.coerce.number().min(1).max(200).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      metric: url.searchParams.get("metric") ?? "energy",
      range: url.searchParams.get("range") ?? "day",
      scope: url.searchParams.get("scope") ?? "global",
      limit: url.searchParams.get("limit") ?? 50,
    });
    if (!parsed.success) return badRequest("Invalid query");
    const { metric, range, scope, limit } = parsed.data;

    const session = await auth();
    const me = session?.user?.id
      ? await db.user.findUnique({ where: { id: session.user.id } })
      : null;

    // Always honour the user-controlled "Show on leaderboard" flag.
    // The signed-in user themselves is exempt so they always see
    // their own rank, even when hidden globally.
    const userFilter: Prisma.UserWhereInput = me?.id
      ? { OR: [{ showOnLeaderboard: true }, { id: me.id }] }
      : { showOnLeaderboard: true };
    if (scope === "men") userFilter.gender = "MALE";
    if (scope === "women") userFilter.gender = "FEMALE";
    if (scope === "age" && me?.age) {
      const bucket = Math.floor(me.age / 5) * 5;
      userFilter.age = { gte: bucket, lt: bucket + 5 };
    }
    if (scope === "fitness" && me?.fitnessLevel) {
      userFilter.fitnessLevel = me.fitnessLevel;
    }
    if (scope === "friends" && me) {
      const follows = await db.follow.findMany({
        where: { followerId: me.id },
        select: { followingId: true },
      });
      const ids = [me.id, ...follows.map((f) => f.followingId)];
      userFilter.id = { in: ids };
    }

    if (metric === "level" || metric === "xp") {
      const orderBy: Prisma.UserOrderByWithRelationInput =
        metric === "level"
          ? { totalXp: "desc" }
          : { totalXp: "desc" };

      const users = await db.user.findMany({
        where: userFilter,
        orderBy,
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          totalXp: true,
          totalEnergy: true,
          level: true,
          currentStreak: true,
          gender: true,
          age: true,
          fitnessLevel: true,
        },
      });

      return ok({
        metric,
        range,
        scope,
        rows: users.map((u, i) => ({
          rank: i + 1,
          userId: u.id,
          name: u.name ?? u.username ?? "Anon",
          username: u.username,
          avatar: u.image,
          level: u.level,
          xp: u.totalXp,
          energy: u.totalEnergy,
          streak: u.currentStreak,
          gender: u.gender,
          age: u.age,
          fitnessLevel: u.fitnessLevel,
          division: getDivision(u.level),
          isMe: me?.id === u.id,
        })),
        meRank: me ? null : null,
      });
    }

    const start =
      range === "day"
        ? startOfToday()
        : range === "week"
          ? new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          : new Date(0);

    const groups = await db.activityRecord.groupBy({
      by: ["userId"],
      where: { recordedAt: { gte: start } },
      _sum: { energy: true, xp: true },
      orderBy: { _sum: { energy: "desc" } },
      take: limit,
    });

    let userIds = groups.map((g) => g.userId);
    if (Object.keys(userFilter).length > 0) {
      const filteredUsers = await db.user.findMany({
        where: { ...userFilter, id: { in: userIds } },
        select: { id: true },
      });
      const allowed = new Set(filteredUsers.map((u) => u.id));
      userIds = userIds.filter((id) => allowed.has(id));
    }

    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        totalXp: true,
        totalEnergy: true,
        level: true,
        currentStreak: true,
        gender: true,
        age: true,
        fitnessLevel: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const rows = userIds
      .map((id, i) => {
        const u = userMap.get(id);
        const group = groups.find((g) => g.userId === id);
        if (!u || !group) return null;
        return {
          rank: i + 1,
          userId: u.id,
          name: u.name ?? u.username ?? "Anon",
          username: u.username,
          avatar: u.image,
          level: u.level,
          xp: u.totalXp,
          energy: group._sum.energy ?? 0,
          streak: u.currentStreak,
          gender: u.gender,
          age: u.age,
          fitnessLevel: u.fitnessLevel,
          division: getDivision(u.level),
          isMe: me?.id === u.id,
        };
      })
      .filter(Boolean);

    return ok({ metric, range, scope, rows });
  } catch (error) {
    return serverError(error);
  }
}
