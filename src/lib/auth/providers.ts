import type { Provider } from "next-auth/providers";
import type { OAuthConfig } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import VK from "next-auth/providers/vk";
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
  if (env.oauth.vk) {
    const vk = VK({
      clientId: env.AUTH_VK_ID,
      clientSecret: env.AUTH_VK_SECRET,
      allowDangerousEmailAccountLinking: true,
    }) as OAuthConfig<Record<string, unknown>>;
    // VK's classic OAuth (`oauth.vk.com/authorize`) does not support PKCE,
    // it returns `invalid_request: Code challenge method is unsupported`
    // when Auth.js sends the default `["pkce", "state"]` checks.
    vk.checks = ["state"];
    providers.push(vk);
  }

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
