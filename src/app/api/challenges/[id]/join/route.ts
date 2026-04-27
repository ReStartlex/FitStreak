import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api/response";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { id } = await ctx.params;
    const challenge = await db.challenge.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!challenge) return notFound();

    const existing = await db.challengeParticipant.findUnique({
      where: { userId_challengeId: { userId: session.user.id, challengeId: challenge.id } },
    });
    if (existing) {
      return ok({ joined: true, alreadyJoined: true });
    }

    await db.$transaction([
      db.challengeParticipant.create({
        data: {
          userId: session.user.id,
          challengeId: challenge.id,
        },
      }),
      db.challenge.update({
        where: { id: challenge.id },
        data: { participantsCount: { increment: 1 } },
      }),
    ]);

    return ok({ joined: true });
  } catch (error) {
    return serverError(error);
  }
}
