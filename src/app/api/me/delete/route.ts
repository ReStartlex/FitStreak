import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  badRequest,
  unauthorized,
  serverError,
  tooMany,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";
import { getSessionCookieName } from "@/lib/auth/session";

export const runtime = "nodejs";

const schema = z.object({
  confirm: z.literal("DELETE"),
});

/**
 * Hard-deletes the authenticated user's account and all related data.
 * Cascades on the schema take care of activity records, achievements,
 * follows, etc.
 *
 * Requires the client to send `{ "confirm": "DELETE" }` to avoid
 * accidental deletion via misclick. Also clears the session cookie
 * so the page redirect lands on a logged-out state.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`me-del:${clientId(request)}`, 3, 60 * 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("CONFIRM_REQUIRED");

    await db.user.delete({ where: { id: session.user.id } });

    const res = NextResponse.json({ ok: true });
    const isProd = process.env.NODE_ENV === "production";
    res.cookies.delete(getSessionCookieName(true));
    res.cookies.delete(getSessionCookieName(false));
    if (isProd) res.cookies.delete("__Secure-authjs.callback-url");
    res.cookies.delete("authjs.callback-url");
    return res;
  } catch (error) {
    return serverError(error);
  }
}
