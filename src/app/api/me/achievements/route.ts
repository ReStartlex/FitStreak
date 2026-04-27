import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";

export const runtime = "nodejs";

/**
 * GET /api/me/achievements
 *
 * Returns ALL achievements paired with the user's earned status.
 * Unlocked ones come first; locked ones surface as "next milestones".
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const [allAchievements, mine] = await Promise.all([
      db.achievement.findMany({
        orderBy: [{ tier: "asc" }, { rewardXp: "asc" }],
      }),
      db.userAchievement.findMany({
        where: { userId: session.user.id },
      }),
    ]);

    const myMap = new Map(mine.map((u) => [u.achievementId, u]));

    const items = allAchievements.map((a) => {
      const u = myMap.get(a.id);
      return {
        slug: a.slug,
        titleRu: a.titleRu,
        titleEn: a.titleEn,
        descRu: a.descRu,
        descEn: a.descEn,
        icon: a.icon,
        tier: a.tier,
        rewardXp: a.rewardXp,
        unlocked: Boolean(u),
        count: u?.count ?? 0,
        unlockedAt: u?.unlockedAt ?? null,
        lastEarnedAt: u?.lastEarnedAt ?? null,
      };
    });

    items.sort((a, b) => {
      if (a.unlocked === b.unlocked) return 0;
      return a.unlocked ? -1 : 1;
    });

    return ok({ items });
  } catch (error) {
    return serverError(error);
  }
}
