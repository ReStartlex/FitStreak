import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";

import { db } from "@/lib/db";
import { badRequest, serverError, tooMany } from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import { consumeResetCode } from "@/lib/auth/password-reset";
import { setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(255),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`pwd-conf:${clientId(request)}`, 8, 15 * 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("INVALID");

    const email = parsed.data.email.toLowerCase();
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, image: true, onboarded: true },
    });
    if (!user) return badRequest("USER_NOT_FOUND");

    const result = await consumeResetCode(email, parsed.data.code);
    if (!result.ok) {
      const c =
        result.reason === "EXPIRED"
          ? "CODE_EXPIRED"
          : result.reason === "INVALID"
            ? "CODE_INVALID"
            : "CODE_NOT_FOUND";
      return badRequest(c);
    }

    const passwordHash = await hash(parsed.data.password, 12);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        // Reset codes are only sent to verified emails (existing users), so
        // it's safe to mark email as verified here as well in case the
        // account was somehow stuck pending.
        emailVerified: new Date(),
      },
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
