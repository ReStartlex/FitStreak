import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { tooMany, badRequest, serverError } from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import { consumeVerificationCode } from "@/lib/auth/email-verify";
import { setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(255),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`verify-conf:${clientId(request)}`, 8, 5 * 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("INVALID_CODE");

    const email = parsed.data.email.toLowerCase();
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        onboarded: true,
      },
    });
    if (!user) return badRequest("USER_NOT_FOUND");

    if (user.emailVerified) {
      // Already verified — still issue a fresh session cookie so the user
      // doesn't get stuck if the page reloaded.
      const res = NextResponse.json({
        ok: true,
        alreadyVerified: true,
        onboarded: user.onboarded,
      });
      await setSessionCookie(res, user);
      return res;
    }

    const result = await consumeVerificationCode(email, parsed.data.code);
    if (!result.ok) {
      const code =
        result.reason === "EXPIRED"
          ? "CODE_EXPIRED"
          : result.reason === "INVALID"
            ? "CODE_INVALID"
            : "CODE_NOT_FOUND";
      return badRequest(code);
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    const res = NextResponse.json({
      ok: true,
      onboarded: user.onboarded,
    });
    await setSessionCookie(res, user);
    return res;
  } catch (error) {
    return serverError(error);
  }
}
