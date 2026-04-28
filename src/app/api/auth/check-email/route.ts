import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { ok, badRequest, serverError, tooMany } from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(255),
});

/**
 * Tells the sign-in UI whether the account exists and is verified, so
 * the form can route an unverified user to /verify-email instead of
 * showing a generic "invalid credentials" error.
 *
 * Intentionally low-information: returns just `{ exists, verified }`,
 * never the user id/name. Rate-limited so it can't be used for cheap
 * email enumeration attacks.
 */
export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`check-email:${clientId(request)}`, 12, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const email = parsed.data.email.toLowerCase();
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true, passwordHash: true },
    });
    if (!user) {
      return ok({ exists: false, verified: false, hasPassword: false });
    }
    return ok({
      exists: true,
      verified: Boolean(user.emailVerified),
      hasPassword: Boolean(user.passwordHash),
    });
  } catch (error) {
    return serverError(error);
  }
}
