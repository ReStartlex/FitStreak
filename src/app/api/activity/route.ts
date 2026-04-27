import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  unauthorized,
  serverError,
  tooMany,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import {
  logActivity,
  startOfToday,
} from "@/lib/api/activity-service";

export const runtime = "nodejs";

const postSchema = z.object({
  exerciseId: z.string().min(1).max(40),
  amount: z.number().positive().max(10_000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`activity:${session.user.id}`, 60, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const ipLimit = rateLimit(`activity-ip:${clientId(request)}`, 120, 60_000);
    if (!ipLimit.ok) return tooMany(ipLimit.resetAt);

    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid payload", parsed.error.flatten());
    }

    const result = await logActivity(
      session.user.id,
      parsed.data.exerciseId,
      parsed.data.amount,
    );
    if (!result.ok) {
      return badRequest(result.reason, { message: result.message });
    }

    return ok(result, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

const getSchema = z.object({
  range: z.enum(["today", "week", "month"]).default("today"),
  limit: z.coerce.number().min(1).max(200).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const url = new URL(request.url);
    const parsed = getSchema.safeParse({
      range: url.searchParams.get("range") ?? "today",
      limit: url.searchParams.get("limit") ?? 50,
    });
    if (!parsed.success) return badRequest("Invalid query");

    const today = startOfToday();
    const since = new Date(today);
    if (parsed.data.range === "week") since.setDate(since.getDate() - 6);
    if (parsed.data.range === "month") since.setDate(since.getDate() - 29);

    const records = await db.activityRecord.findMany({
      where: { userId: session.user.id, recordedAt: { gte: since } },
      orderBy: { recordedAt: "desc" },
      take: parsed.data.limit,
      select: {
        id: true,
        exerciseId: true,
        amount: true,
        energy: true,
        xp: true,
        kcal: true,
        recordedAt: true,
        source: true,
      },
    });

    return ok({ records });
  } catch (error) {
    return serverError(error);
  }
}
