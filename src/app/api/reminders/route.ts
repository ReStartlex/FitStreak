import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  tooMany,
  unauthorized,
  serverError,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  morningTime: z.string().regex(timePattern).optional(),
  eveningTime: z.string().regex(timePattern).optional(),
  weekendsOff: z.boolean().optional(),
  smartMode: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const config = await db.reminderConfig.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });
    return ok({ config });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`reminders:${session.user.id ?? clientId(request)}`, 30, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

    const config = await db.reminderConfig.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...parsed.data },
      update: parsed.data,
    });
    return ok({ config });
  } catch (error) {
    return serverError(error);
  }
}
