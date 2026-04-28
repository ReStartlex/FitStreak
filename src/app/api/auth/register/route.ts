import { NextRequest } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";

import { db } from "@/lib/db";
import { ok, badRequest, serverError, tooMany } from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import {
  issueVerificationCode,
  sendVerificationEmail,
} from "@/lib/auth/email-verify";

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
    const lowEmail = email.toLowerCase();

    const existing = await db.user.findUnique({ where: { email: lowEmail } });

    if (existing && existing.emailVerified) {
      return badRequest("EMAIL_TAKEN");
    }

    if (existing && !existing.emailVerified) {
      // Pending registration exists. Re-issue a code so the legitimate
      // owner of the inbox can finish signing up, but DO NOT touch the
      // password — otherwise anyone could squat an unverified email and
      // hijack the account once the real owner enters the code.
      const { code, expiresAt } = await issueVerificationCode(lowEmail);
      await sendVerificationEmail({ email: lowEmail, code, locale });
      return ok(
        {
          requiresVerification: true,
          pending: true,
          email: lowEmail,
          expiresAt: expiresAt.toISOString(),
        },
        { status: 200 },
      );
    }

    const passwordHash = await hash(password, 12);
    await db.user.create({
      data: {
        email: lowEmail,
        passwordHash,
        name: name ?? lowEmail.split("@")[0],
        locale,
        reminders: { create: {} },
      },
    });

    const { code, expiresAt } = await issueVerificationCode(lowEmail);
    await sendVerificationEmail({ email: lowEmail, code, locale });

    return ok(
      {
        requiresVerification: true,
        email: lowEmail,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return serverError(error);
  }
}
