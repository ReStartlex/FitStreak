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

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Only lowercase a-z, 0-9, _")
    .optional()
    .or(z.literal("")),
  locale: z.enum(["ru", "en"]).optional(),
  image: z.string().url().max(500).optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(
      `profile:${session.user.id ?? clientId(request)}`,
      20,
      60_000,
    );
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid payload", parsed.error.flatten());
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
    if (parsed.data.locale !== undefined) data.locale = parsed.data.locale;
    if (parsed.data.image !== undefined) {
      data.image = parsed.data.image === "" ? null : parsed.data.image;
    }
    if (parsed.data.username !== undefined) {
      const u = parsed.data.username === "" ? null : parsed.data.username;
      if (u) {
        const existing = await db.user.findFirst({
          where: { username: u, NOT: { id: session.user.id } },
          select: { id: true },
        });
        if (existing) return badRequest("USERNAME_TAKEN");
      }
      data.username = u;
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        locale: true,
        image: true,
      },
    });
    return ok({ user });
  } catch (error) {
    return serverError(error);
  }
}
