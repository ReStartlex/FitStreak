import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

interface VKIDTokenResponse {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  user_id?: number | string;
  scope?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

interface VKIDUserInfoResponse {
  user?: {
    user_id?: number | string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    sex?: number;
    birthday?: string;
    verified?: boolean;
  };
  error?: string;
}

function fail(req: NextRequest, error: string) {
  const url = new URL("/signin", req.url);
  url.searchParams.set("error", error);
  const res = NextResponse.redirect(url);
  // best-effort cleanup of pkce/state cookies
  ["vkid_state", "vkid_verifier", "vkid_callback"].forEach((n) =>
    res.cookies.delete(n),
  );
  return res;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  if (params.get("error")) {
    console.error("[vkid] auth error:", params.get("error"), params.get("error_description"));
    return fail(req, "VKID_DENIED");
  }

  const code = params.get("code");
  const state = params.get("state");
  const deviceId = params.get("device_id");

  const cookieState = req.cookies.get("vkid_state")?.value ?? null;
  const verifier = req.cookies.get("vkid_verifier")?.value ?? null;
  const callbackUrl = req.cookies.get("vkid_callback")?.value || "/dashboard";

  if (!code || !state || !cookieState || state !== cookieState || !verifier) {
    return fail(req, "VKID_STATE");
  }
  if (!deviceId) {
    // VK ID always returns device_id; if it's missing something is off
    return fail(req, "VKID_DEVICE");
  }
  if (!env.AUTH_VK_ID) {
    return fail(req, "Configuration");
  }

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/vkid/callback`;

  // 1) Exchange code for tokens
  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.AUTH_VK_ID,
    device_id: deviceId,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    state,
  });
  // VK ID accepts both with and without client_secret on the token endpoint
  // (it's a public OAuth2.1 client with PKCE), but we send it when present
  // so secret-protected apps also work.
  if (env.AUTH_VK_SECRET) {
    tokenBody.set("client_secret", env.AUTH_VK_SECRET);
  }

  let tokens: VKIDTokenResponse;
  try {
    const res = await fetch("https://id.vk.com/oauth2/auth", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: tokenBody,
    });
    tokens = (await res.json()) as VKIDTokenResponse;
  } catch (err) {
    console.error("[vkid] token request failed", err);
    return fail(req, "VKID_TOKEN");
  }

  if (!tokens.access_token || tokens.error) {
    console.error("[vkid] token response error", tokens);
    return fail(req, "VKID_TOKEN");
  }

  // 2) Fetch user info
  let info: VKIDUserInfoResponse;
  try {
    const res = await fetch("https://id.vk.com/oauth2/user_info", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.AUTH_VK_ID,
        access_token: tokens.access_token,
      }),
    });
    info = (await res.json()) as VKIDUserInfoResponse;
  } catch (err) {
    console.error("[vkid] user_info request failed", err);
    return fail(req, "VKID_USERINFO");
  }

  const profile = info.user;
  if (!profile?.user_id) {
    console.error("[vkid] empty user_info", info);
    return fail(req, "VKID_USERINFO");
  }

  const vkAccountId = String(profile.user_id);
  const email = profile.email?.toLowerCase() || null;
  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
    null;

  // 3) Find or create user + Account record
  let userId: string;
  const existingAccount = await db.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "vkid",
        providerAccountId: vkAccountId,
      },
    },
    select: { userId: true },
  });

  if (existingAccount) {
    userId = existingAccount.userId;
    // refresh tokens on the account
    await db.account.update({
      where: {
        provider_providerAccountId: {
          provider: "vkid",
          providerAccountId: vkAccountId,
        },
      },
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: tokens.expires_in
          ? Math.floor(Date.now() / 1000) + tokens.expires_in
          : null,
        token_type: tokens.token_type ?? "bearer",
        scope: tokens.scope ?? null,
      },
    });
  } else {
    if (!email) {
      // Without an email we can't reliably link accounts; ask user to give VK
      // permission to share email or use another method.
      return fail(req, "VKID_NO_EMAIL");
    }

    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          emailVerified: new Date(),
          name: fullName ?? email.split("@")[0],
          image: profile.avatar ?? null,
          locale: "ru",
          reminders: { create: {} },
        },
      });
    }
    await db.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider: "vkid",
        providerAccountId: vkAccountId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: tokens.expires_in
          ? Math.floor(Date.now() / 1000) + tokens.expires_in
          : null,
        token_type: tokens.token_type ?? "bearer",
        scope: tokens.scope ?? null,
      },
    });
    userId = user.id;
  }

  // 4) Build session response
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      onboarded: true,
    },
  });
  if (!user) return fail(req, "VKID_USER_MISSING");

  const dest = user.onboarded ? callbackUrl : "/onboarding";
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.cookies.delete("vkid_state");
  res.cookies.delete("vkid_verifier");
  res.cookies.delete("vkid_callback");

  await setSessionCookie(res, {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  });

  return res;
}
