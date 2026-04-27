import { NextRequest } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";

import { db } from "@/lib/db";
import { ok, badRequest, serverError, tooMany } from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(80).optional(),
  locale: z.enum(["ru", "en"]).default("ru"),
});

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`register:${clientId(request)}`, 5, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid payload", parsed.error.flatten());
    }
    const { email, password, name, locale } = parsed.data;

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return badRequest("EMAIL_TAKEN");
    }

    const passwordHash = await hash(password, 12);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name ?? email.split("@")[0],
        locale,
        reminders: {
          create: {},
        },
      },
      select: { id: true, email: true, name: true },
    });

    return ok({ user }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
