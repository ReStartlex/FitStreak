import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const myId = session?.user?.id ?? null;

    const challenges = await db.challenge.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        participants: myId
          ? { where: { userId: myId }, select: { progress: true, completed: true } }
          : false,
      },
    });

    return ok({
      challenges: challenges.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: { ru: c.titleRu, en: c.titleEn },
        description: { ru: c.descRu, en: c.descEn },
        metric: c.metric,
        exerciseId: c.exerciseId,
        goal: c.goal,
        durationDays: c.durationDays,
        difficulty: c.difficulty,
        rewardXp: c.rewardXp,
        rewardEnergy: c.rewardEnergy,
        participantsCount: c.participantsCount,
        isFeatured: c.isFeatured,
        myProgress: c.participants?.[0]?.progress ?? null,
        joined: Boolean(c.participants?.[0]),
        completed: Boolean(c.participants?.[0]?.completed),
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
