import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { ok, badRequest, serverError, tooMany } from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import {
  issueResetCode,
  sendPasswordResetEmail,
} from "@/lib/auth/password-reset";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(255),
  locale: z.enum(["ru", "en"]).default("ru"),
});

export async function POST(request: NextRequest) {
  try {
    // 3 reset requests per IP per 15 minutes
    const limit = rateLimit(`pwd-req:${clientId(request)}`, 3, 15 * 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const email = parsed.data.email.toLowerCase();
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    // Always respond OK to prevent email enumeration. Only actually send
    // if the user exists AND has a password (OAuth-only accounts shouldn't
    // get a reset link).
    if (user && user.passwordHash) {
      const { code } = await issueResetCode(email);
      await sendPasswordResetEmail({ email, code, locale: parsed.data.locale });
    }

    return ok({ sent: true });
  } catch (error) {
    return serverError(error);
  }
}
