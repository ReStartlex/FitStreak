import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Live user search for the global header autocomplete. Public, but
 * we only return public-safe columns (no email/age/etc.). Accepts:
 *   GET /api/users/search?q=foo
 *
 * The query matches `username` first (prefix), then `name` substring,
 * up to 10 results. Trim and lowercase server-side; minimum 2 chars.
 */
export async function GET(request: NextRequest) {
  try {
    const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
    if (q.length < 2) return badRequest("MIN_LENGTH");
    const lower = q.toLowerCase();

    const users = await db.user.findMany({
      where: {
        OR: [
          { username: { startsWith: lower, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        level: true,
        currentStreak: true,
        totalEnergy: true,
      },
      orderBy: [{ totalEnergy: "desc" }, { username: "asc" }],
      take: 10,
    });

    return ok(
      {
        users: users.map((u) => ({
          id: u.id,
          name: u.name ?? u.username ?? "Athlete",
          username: u.username,
          image: u.image,
          level: u.level,
          currentStreak: u.currentStreak,
        })),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=10",
        },
      },
    );
  } catch (error) {
    return serverError(error);
  }
}
