import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),

  AUTH_SECRET: z.string().min(16).optional(),
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_YANDEX_ID: z.string().optional(),
  AUTH_YANDEX_SECRET: z.string().optional(),
  AUTH_VK_ID: z.string().optional(),
  AUTH_VK_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),

  ENABLE_OAUTH_GOOGLE: z
    .union([z.literal("true"), z.literal("false")])
    .default("true"),
  ENABLE_OAUTH_YANDEX: z
    .union([z.literal("true"), z.literal("false")])
    .default("true"),
  ENABLE_OAUTH_VK: z
    .union([z.literal("true"), z.literal("false")])
    .default("true"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "[env] Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
}

const data = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof envSchema>);

export const env = {
  ...data,
  hasDatabase: Boolean(data.DATABASE_URL),
  hasAuthSecret: Boolean(data.AUTH_SECRET || data.NEXTAUTH_SECRET),
  oauth: {
    google:
      data.ENABLE_OAUTH_GOOGLE === "true" &&
      Boolean(data.AUTH_GOOGLE_ID && data.AUTH_GOOGLE_SECRET),
    yandex:
      data.ENABLE_OAUTH_YANDEX === "true" &&
      Boolean(data.AUTH_YANDEX_ID && data.AUTH_YANDEX_SECRET),
    vk:
      data.ENABLE_OAUTH_VK === "true" &&
      Boolean(data.AUTH_VK_ID && data.AUTH_VK_SECRET),
  },
  resend: {
    enabled: Boolean(data.RESEND_API_KEY),
    apiKey: data.RESEND_API_KEY,
    from: data.RESEND_FROM ?? "FitStreak <noreply@fitstreak.app>",
  },
} as const;

export type Env = typeof env;
