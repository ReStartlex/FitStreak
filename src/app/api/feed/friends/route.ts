import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real "friends activity" feed for the dashboard. Shows the most
 * recent activity records from the people the current user follows
 * (last 7 days, max 30 items).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const follows = await db.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    if (follows.length === 0) {
      return ok({ items: [] });
    }

    const ids = follows.map((f) => f.followingId);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60_000);

    const records = await db.activityRecord.findMany({
      where: { userId: { in: ids }, recordedAt: { gte: since } },
      orderBy: { recordedAt: "desc" },
      take: 30,
      select: {
        id: true,
        exerciseId: true,
        amount: true,
        energy: true,
        xp: true,
        recordedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            currentStreak: true,
          },
        },
      },
    });

    return ok({
      items: records.map((r) => ({
        id: r.id,
        exerciseId: r.exerciseId,
        amount: r.amount,
        energy: r.energy,
        xp: r.xp,
        recordedAt: r.recordedAt.toISOString(),
        user: {
          id: r.user.id,
          name: r.user.name ?? r.user.username ?? "Athlete",
          username: r.user.username,
          image: r.user.image,
          currentStreak: r.user.currentStreak,
        },
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
