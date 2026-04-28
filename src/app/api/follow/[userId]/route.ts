import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  unauthorized,
  notFound,
  serverError,
  tooMany,
} from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

interface Params {
  userId: string;
}

/**
 * Toggle "follow" between the signed-in user and `userId`.
 *
 *  - POST   → idempotently follow.
 *  - DELETE → idempotently unfollow.
 *
 * No payload, no extra side effects yet — feed/notifications can hook
 * onto the row creation later.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  return mutate("follow", request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  return mutate("unfollow", request, params);
}

async function mutate(
  action: "follow" | "unfollow",
  _request: NextRequest,
  paramsPromise: Promise<Params>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`follow:${session.user.id}`, 60, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const { userId } = await paramsPromise;
    if (!userId) return badRequest("Missing userId");
    if (userId === session.user.id) {
      return badRequest("CANNOT_FOLLOW_SELF");
    }

    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) return notFound("User not found");

    if (action === "follow") {
      await db.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId,
          },
        },
        create: { followerId: session.user.id, followingId: userId },
        update: {},
      });
      return ok({ following: true });
    }

    await db.follow.deleteMany({
      where: { followerId: session.user.id, followingId: userId },
    });
    return ok({ following: false });
  } catch (error) {
    return serverError(error);
  }
}
