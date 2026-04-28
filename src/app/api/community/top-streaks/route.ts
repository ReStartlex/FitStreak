import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api/response";
import { getBlockedSets } from "@/lib/api/blocks";

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
    const session = await auth();
    const blocks = await getBlockedSets(session?.user?.id ?? null);
    const users = await db.user.findMany({
      where: {
        currentStreak: { gt: 0 },
        showOnLeaderboard: true,
        isPublic: true,
        ...(blocks.any.size > 0
          ? { id: { notIn: Array.from(blocks.any) } }
          : {}),
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
          // Block-aware → response varies per signed-in user, so no
          // shared CDN cache. Lightly cache in the browser.
          "Cache-Control": "private, max-age=60",
        },
      },
    );
  } catch (error) {
    return serverError(error);
  }
}
