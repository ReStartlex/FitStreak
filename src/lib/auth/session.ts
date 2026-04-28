import { encode } from "next-auth/jwt";
import type { NextResponse } from "next/server";

import { env } from "@/lib/env";

/**
 * Manual session-cookie helper.
 *
 * Auth.js v5 uses `authjs.session-token` (or `__Secure-authjs.session-token`
 * in production) as the JWT cookie. The cookie name is also used as the
 * `salt` for the JWE encryption derivation.
 *
 * We use this for custom auth flows (VK ID, email-verify auto-login)
 * where we want to issue a session without going through a Credentials
 * provider — the `signIn` server function from Auth.js is awkward inside
 * Route Handlers, so we build the cookie ourselves.
 */

export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, matches default

export function getSessionCookieName(secure: boolean): string {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secret = env.AUTH_SECRET ?? env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  const cookieName = getSessionCookieName(true);
  return encode({
    salt: cookieName,
    secret,
    maxAge: SESSION_MAX_AGE,
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      picture: user.image ?? null,
    },
  });
}

/**
 * Sets the session cookie on a NextResponse.
 *
 * In production we use `__Secure-authjs.session-token` (HTTPS-only),
 * in development plain `authjs.session-token`.
 */
export async function setSessionCookie(
  response: NextResponse,
  user: SessionUser,
  secure: boolean = process.env.NODE_ENV === "production",
) {
  const secret = env.AUTH_SECRET ?? env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  const cookieName = getSessionCookieName(secure);
  const token = await encode({
    salt: cookieName,
    secret,
    maxAge: SESSION_MAX_AGE,
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      picture: user.image ?? null,
    },
  });
  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
