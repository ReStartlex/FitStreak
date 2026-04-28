import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";
import { getLevelInfo } from "@/lib/leveling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tiny "header chip" endpoint — used by the global Header to render
 * a live streak/level pill without paying the cost of /api/me.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentStreak: true,
        bestStreak: true,
        level: true,
        totalXp: true,
        username: true,
      },
    });
    if (!user) return unauthorized();

    const lvl = getLevelInfo(user.totalXp);
    return ok({
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      level: user.level,
      levelProgressPct: Math.round(lvl.progress),
      username: user.username,
    });
  } catch (error) {
    return serverError(error);
  }
}
