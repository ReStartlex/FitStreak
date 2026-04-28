import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { ok, badRequest, serverError, tooMany } from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import {
  issueVerificationCode,
  sendVerificationEmail,
} from "@/lib/auth/email-verify";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(255),
  locale: z.enum(["ru", "en"]).default("ru"),
});

export async function POST(request: NextRequest) {
  try {
    // 3 codes / 5 min — enough for a real user, painful for abuse
    const limit = rateLimit(`verify-req:${clientId(request)}`, 3, 5 * 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const email = parsed.data.email.toLowerCase();
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    // Don't leak whether the email exists; respond OK either way unless
    // the user is already verified (in which case we surface that so the
    // UI can route them to /signin).
    if (user?.emailVerified) {
      return ok({ alreadyVerified: true });
    }

    if (user) {
      const { code, expiresAt } = await issueVerificationCode(email);
      await sendVerificationEmail({ email, code, locale: parsed.data.locale });
      return ok({ sent: true, expiresAt: expiresAt.toISOString() });
    }

    return ok({ sent: true });
  } catch (error) {
    return serverError(error);
  }
}
