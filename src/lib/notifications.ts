import { db } from "@/lib/db";
import type { NotificationType, Prisma } from "@prisma/client";

interface CreateOpts {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  data?: Record<string, unknown>;
  /**
   * If true (default) and an unread notification of the same type+actor
   * was created in the last hour, we update it instead of creating a new
   * row. Prevents duplicate spam (e.g. two follow-toggles in a row).
   */
  collapseRecentMs?: number;
}

const FALLBACK_COLLAPSE_MS = 60 * 60 * 1000; // 1h

/**
 * Best-effort notification writer — always swallows errors so the
 * caller's main mutation never fails because of a notification hiccup.
 */
export async function createNotification(opts: CreateOpts): Promise<void> {
  try {
    if (opts.actorId && opts.actorId === opts.userId) return; // never notify self
    const collapseMs = opts.collapseRecentMs ?? FALLBACK_COLLAPSE_MS;
    const cutoff = new Date(Date.now() - collapseMs);

    const existing = await db.notification.findFirst({
      where: {
        userId: opts.userId,
        type: opts.type,
        actorId: opts.actorId ?? null,
        readAt: null,
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      await db.notification.update({
        where: { id: existing.id },
        data: {
          createdAt: new Date(),
          data: (opts.data ?? null) as unknown as Prisma.InputJsonValue,
        },
      });
      return;
    }

    await db.notification.create({
      data: {
        userId: opts.userId,
        actorId: opts.actorId ?? null,
        type: opts.type,
        data: (opts.data ?? null) as unknown as Prisma.InputJsonValue,
      },
    });
  } catch {
    // notifications are best-effort — never throw upwards
  }
}
