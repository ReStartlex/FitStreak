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

const reasonSchema = z
  .object({ reason: z.string().max(280).optional() })
  .optional();

/**
 * POST /api/block/[userId] — block a user (idempotent). Also breaks
 * mutual follows in both directions and stops notifications between
 * the two parties going forward.
 *
 * DELETE — unblock. No follow restoration.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`block:${session.user.id}`, 30, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const { userId } = await params;
    if (userId === session.user.id) {
      return badRequest("CANNOT_BLOCK_SELF");
    }

    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) return notFound("User not found");

    let parsed: z.infer<typeof reasonSchema> = undefined;
    try {
      const body = await request.json();
      const r = reasonSchema.safeParse(body);
      if (r.success) parsed = r.data;
    } catch {
      // empty body is fine
    }

    await db.$transaction([
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
          reason: parsed?.reason ?? null,
        },
        update: { reason: parsed?.reason ?? null },
      }),
      // Tear down both directions of follow.
      db.follow.deleteMany({
        where: {
          OR: [
            { followerId: session.user.id, followingId: userId },
            { followerId: userId, followingId: session.user.id },
          ],
        },
      }),
    ]);

    return ok({ blocked: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { userId } = await params;
    await db.block.deleteMany({
      where: { blockerId: session.user.id, blockedId: userId },
    });
    return ok({ blocked: false });
  } catch (error) {
    return serverError(error);
  }
}
