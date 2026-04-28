import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the list of users I've blocked, with display info so the
 * settings page can render them and offer "unblock" buttons.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const blocks = await db.block.findMany({
      where: { blockerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });
    return ok({
      items: blocks.map((b) => ({
        id: b.blocked.id,
        name: b.blocked.name ?? b.blocked.username ?? "Athlete",
        username: b.blocked.username,
        image: b.blocked.image,
        reason: b.reason,
        blockedAt: b.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
