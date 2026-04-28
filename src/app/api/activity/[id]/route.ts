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
import { recomputeUserAggregates } from "@/lib/api/recompute";
import { calcEnergyScore, calcXP, calcKcal } from "@/lib/scoring";
import { userToBodyMetrics } from "@/lib/api/activity-service";
import { validateAmount } from "@/lib/api/anti-cheat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

/**
 * Edit-window: a record can be modified or deleted up to 24 hours
 * after creation. Older records are immutable so XP/streak can't be
 * rewritten retroactively.
 */
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const patchSchema = z.object({
  amount: z.number().positive().max(100_000),
});

/**
 * DELETE /api/activity/:id — owner-only. Recomputes user totals and
 * streak after deletion. Reactions to the activity cascade away via
 * the schema relation.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`activity-mut:${session.user.id}`, 60, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const { id } = await params;
    const record = await db.activityRecord.findUnique({
      where: { id },
      select: { id: true, userId: true, recordedAt: true },
    });
    if (!record) return notFound("Record not found");
    if (record.userId !== session.user.id) return unauthorized();
    if (Date.now() - record.recordedAt.getTime() > EDIT_WINDOW_MS) {
      return badRequest("EDIT_WINDOW_EXPIRED");
    }

    await db.activityRecord.delete({ where: { id } });
    const totals = await recomputeUserAggregates(session.user.id);

    return ok({ ok: true, totals });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * PATCH /api/activity/:id — change the amount on an existing record.
 * Energy / XP / kcal are recomputed; user aggregates re-derived from
 * scratch.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`activity-mut:${session.user.id}`, 60, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const { id } = await params;
    const record = await db.activityRecord.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        recordedAt: true,
        exerciseId: true,
      },
    });
    if (!record) return notFound("Record not found");
    if (record.userId !== session.user.id) return unauthorized();
    if (Date.now() - record.recordedAt.getTime() > EDIT_WINDOW_MS) {
      return badRequest("EDIT_WINDOW_EXPIRED");
    }

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return badRequest("VALIDATION");

    const newAmount = parsed.data.amount;
    const validation = validateAmount(record.exerciseId, newAmount, 0);
    if (!validation.ok) {
      return badRequest(validation.reason ?? "VALIDATION");
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return unauthorized();
    const metrics = userToBodyMetrics(user);

    const energy = calcEnergyScore(record.exerciseId, newAmount);
    const xp = calcXP(record.exerciseId, newAmount);
    const kcal = calcKcal(record.exerciseId, newAmount, metrics);

    await db.activityRecord.update({
      where: { id },
      data: { amount: newAmount, energy, xp, kcal },
    });
    const totals = await recomputeUserAggregates(session.user.id);

    return ok({
      ok: true,
      record: { id, amount: newAmount, energy, xp, kcal },
      totals,
    });
  } catch (error) {
    return serverError(error);
  }
}
