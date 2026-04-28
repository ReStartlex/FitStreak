import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, badRequest, unauthorized, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().default(false),
});

/**
 * GET /api/notifications — list current user's notifications + unread count.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      limit: url.searchParams.get("limit") ?? 20,
      unreadOnly: url.searchParams.get("unreadOnly") ?? false,
    });
    if (!parsed.success) return badRequest("Invalid query");

    const { limit, unreadOnly } = parsed.data;

    const [items, unread] = await Promise.all([
      db.notification.findMany({
        where: {
          userId: session.user.id,
          ...(unreadOnly ? { readAt: null } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      db.notification.count({
        where: { userId: session.user.id, readAt: null },
      }),
    ]);

    return ok({
      unreadCount: unread,
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        data: n.data,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
        actor: n.actor
          ? {
              id: n.actor.id,
              name: n.actor.name ?? n.actor.username ?? "Athlete",
              username: n.actor.username,
              image: n.actor.image,
            }
          : null,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}

const patchSchema = z.object({
  ids: z.array(z.string()).optional(),
  markAllRead: z.boolean().optional(),
});

/**
 * PATCH /api/notifications — mark IDs (or all) as read.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    if (parsed.data.markAllRead) {
      await db.notification.updateMany({
        where: { userId: session.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      return ok({ ok: true });
    }

    if (parsed.data.ids && parsed.data.ids.length > 0) {
      await db.notification.updateMany({
        where: {
          userId: session.user.id,
          id: { in: parsed.data.ids },
          readAt: null,
        },
        data: { readAt: new Date() },
      });
    }
    return ok({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
