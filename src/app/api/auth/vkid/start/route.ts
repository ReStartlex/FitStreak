import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * VK ID OAuth 2.1 (PKCE) authorization start.
 *
 * Why this isn't using the bundled `next-auth/providers/vk`:
 *   - That provider hits the legacy `oauth.vk.com/authorize` endpoint,
 *     which only works for "classic" VK Apps. Apps registered at
 *     `id.vk.com` (the modern VK ID platform) can't use it and respond
 *     with `Security Error` / `invalid_request`.
 *   - VK ID uses `id.vk.com/authorize` and *requires* PKCE S256 plus a
 *     `device_id` round-trip on the token endpoint, which doesn't fit
 *     the standard oauth4webapi flow Auth.js uses.
 *
 * So we drive the flow ourselves: this route generates state + PKCE
 * verifier, stashes them in HttpOnly cookies, and redirects the user
 * to VK ID's auth page. The matching callback route consumes them.
 */

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function GET(req: NextRequest) {
  if (!env.AUTH_VK_ID) {
    return NextResponse.redirect(
      new URL("/signin?error=Configuration", req.url),
    );
  }

  const fromParam = req.nextUrl.searchParams.get("from") || "/dashboard";
  const callbackUrl = (() => {
    try {
      // Only allow same-origin paths
      if (fromParam.startsWith("/") && !fromParam.startsWith("//")) {
        return fromParam;
      }
    } catch {}
    return "/dashboard";
  })();

  const state = base64url(randomBytes(24));
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(
    createHash("sha256").update(verifier).digest(),
  );

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/vkid/callback`;

  const authUrl = new URL("https://id.vk.com/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", env.AUTH_VK_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("scope", "email");

  const res = NextResponse.redirect(authUrl);
  const isProd = process.env.NODE_ENV === "production";
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: 600,
  };
  res.cookies.set({ name: "vkid_state", value: state, ...cookieOpts });
  res.cookies.set({
    name: "vkid_verifier",
    value: verifier,
    ...cookieOpts,
  });
  res.cookies.set({
    name: "vkid_callback",
    value: callbackUrl,
    ...cookieOpts,
  });
  return res;
}
