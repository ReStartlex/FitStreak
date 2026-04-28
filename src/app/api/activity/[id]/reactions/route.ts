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

const EMOJIS = ["FIRE", "CLAP", "STRONG", "HEART", "ROCKET"] as const;
const schema = z.object({ emoji: z.enum(EMOJIS) });

interface Params {
  id: string;
}

/**
 * GET /api/activity/:id/reactions  — list reactions on a record.
 * POST /api/activity/:id/reactions { emoji } — toggle a reaction
 *   (idempotent add when missing, remove if you already left it).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const meId = session?.user?.id ?? null;

    const reactions = await db.activityReaction.findMany({
      where: { recordId: id },
      select: {
        emoji: true,
        userId: true,
      },
    });

    const counts: Record<string, number> = {};
    const my: string[] = [];
    for (const r of reactions) {
      counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
      if (meId && r.userId === meId) my.push(r.emoji);
    }
    return ok({ counts, my });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`react:${session.user.id}`, 60, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid emoji");

    const record = await db.activityRecord.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!record) return notFound("Record not found");
    if (record.userId === session.user.id) {
      return badRequest("CANNOT_REACT_OWN");
    }

    const existing = await db.activityReaction.findUnique({
      where: {
        recordId_userId_emoji: {
          recordId: id,
          userId: session.user.id,
          emoji: parsed.data.emoji,
        },
      },
    });

    if (existing) {
      await db.activityReaction.delete({ where: { id: existing.id } });
      return ok({ toggled: "removed" });
    }
    await db.activityReaction.create({
      data: {
        recordId: id,
        userId: session.user.id,
        emoji: parsed.data.emoji,
      },
    });
    return ok({ toggled: "added" });
  } catch (error) {
    return serverError(error);
  }
}
