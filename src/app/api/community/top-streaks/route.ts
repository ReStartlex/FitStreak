import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
// Always render on-demand — we let the CDN/Cache-Control header below do
// the caching (s-maxage=300). This avoids flaky DB calls at build time.
export const dynamic = "force-dynamic";

/**
 * Public endpoint: top users by current streak.
 *
 * We deliberately surface only display-name + initials and a few
 * non-sensitive aggregates — never email, IP, age, weight, etc.
 */
export async function GET() {
  try {
    const users = await db.user.findMany({
      where: {
        currentStreak: { gt: 0 },
        showOnLeaderboard: true,
        isPublic: true,
      },
      orderBy: [{ currentStreak: "desc" }, { totalXp: "desc" }],
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        currentStreak: true,
        bestStreak: true,
        level: true,
      },
    });

    return ok(
      {
        users: users.map((u) => ({
          id: u.id,
          name: u.name ?? u.username ?? "Athlete",
          username: u.username ?? null,
          image: u.image ?? null,
          currentStreak: u.currentStreak,
          bestStreak: u.bestStreak,
          level: u.level,
        })),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    return serverError(error);
  }
}
