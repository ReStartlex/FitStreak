import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, notFound, serverError } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const session = await auth();
    const myId = session?.user?.id ?? null;

    const challenge = await db.challenge.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        participants: {
          take: 50,
          orderBy: { progress: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) return notFound();

    const me = myId
      ? challenge.participants.find((p) => p.userId === myId) ?? null
      : null;

    return ok({
      challenge: {
        id: challenge.id,
        slug: challenge.slug,
        title: { ru: challenge.titleRu, en: challenge.titleEn },
        description: { ru: challenge.descRu, en: challenge.descEn },
        metric: challenge.metric,
        exerciseId: challenge.exerciseId,
        goal: challenge.goal,
        durationDays: challenge.durationDays,
        difficulty: challenge.difficulty,
        rewardXp: challenge.rewardXp,
        rewardEnergy: challenge.rewardEnergy,
        participantsCount: challenge.participantsCount,
        isFeatured: challenge.isFeatured,
        type: challenge.type,
        createdById: challenge.createdById,
        endsAt: challenge.endsAt?.toISOString() ?? null,
        createdAt: challenge.createdAt.toISOString(),
        leaderboard: challenge.participants.map((p, i) => ({
          rank: i + 1,
          userId: p.userId,
          name: p.user.name ?? p.user.username ?? "Anon",
          avatar: p.user.image,
          level: p.user.level,
          progress: p.progress,
          completed: p.completed,
          isMe: p.userId === myId,
        })),
        myProgress: me?.progress ?? null,
        joined: Boolean(me),
        completed: Boolean(me?.completed),
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
