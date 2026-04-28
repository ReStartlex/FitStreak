import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  notFound,
  unauthorized,
  serverError,
  tooMany,
} from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  userId: string;
}

const schema = z.object({
  category: z.enum([
    "SPAM",
    "HARASSMENT",
    "IMPERSONATION",
    "CHEATING",
    "INAPPROPRIATE",
    "OTHER",
  ]),
  comment: z.string().trim().max(1000).optional(),
});

/**
 * Report a user for abuse. Side effect: the reporter is automatically
 * blocked from the reported user (Block row upsert + follow tear-down)
 * so they get safety benefits the moment they hit submit, without
 * waiting for moderator triage.
 *
 * The /api/block endpoint already has the same behaviour; we replicate
 * the parts we need here (rather than calling it internally) to keep
 * the transaction tight.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`report:${session.user.id}`, 10, 60 * 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const { userId } = await params;
    if (userId === session.user.id) return badRequest("CANNOT_REPORT_SELF");

    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) return notFound("User not found");

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("VALIDATION");

    await db.$transaction([
      db.report.create({
        data: {
          reporterId: session.user.id,
          targetId: userId,
          category: parsed.data.category,
          comment: parsed.data.comment ?? null,
        },
      }),
      // Auto-block. Idempotent.
      db.block.upsert({
        where: {
          blockerId_blockedId: {
            blockerId: session.user.id,
            blockedId: userId,
          },
        },
        create: {
          blockerId: session.user.id,
          blockedId: userId,
          reason: `report:${parsed.data.category}`,
        },
        update: { reason: `report:${parsed.data.category}` },
      }),
      db.follow.deleteMany({
        where: {
          OR: [
            { followerId: session.user.id, followingId: userId },
            { followerId: userId, followingId: session.user.id },
          ],
        },
      }),
    ]);

    return ok({ reported: true });
  } catch (error) {
    return serverError(error);
  }
}
