import type { Provider } from "next-auth/providers";
import type { OAuthConfig } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import { compare } from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export function buildProviders(): Provider[] {
  const providers: Provider[] = [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        // Block sign-in for unverified accounts. We return null (instead
        // of throwing) so the UI gets the standard CredentialsSignin
        // error; the sign-in form makes a separate /api/auth/check-email
        // call to figure out *why* it failed and re-route the user to
        // /verify-email when appropriate.
        if (!user.emailVerified) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        };
      },
    }),
  ];

  if (env.oauth.google) {
    providers.push(
      Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }
  if (env.oauth.yandex) {
    const yandex = Yandex({
      clientId: env.AUTH_YANDEX_ID,
      clientSecret: env.AUTH_YANDEX_SECRET,
      allowDangerousEmailAccountLinking: true,
    }) as OAuthConfig<Record<string, unknown>>;
    // Override default scope (drops `login:avatar` which often isn't enabled
    // on the app and triggers `invalid_scope` from Yandex). We only need
    // login + email for account creation.
    yandex.authorization = {
      url: "https://oauth.yandex.ru/authorize",
      params: { scope: "login:info login:email" },
    };
    providers.push(yandex);
  }

  // VK ID is handled by a custom flow at /api/auth/vkid/* — see the
  // route handlers there. The `next-auth/providers/vk` provider only
  // supports the legacy `oauth.vk.com` endpoint which doesn't work
  // for apps registered at id.vk.com (modern VK ID).

  return providers;
}

export function enabledProvidersList() {
  return {
    credentials: true,
    google: env.oauth.google,
    yandex: env.oauth.yandex,
    vk: env.oauth.vk,
  } as const;
}
