/**
 * Single source of truth for SEO / branding constants.
 *
 * IMPORTANT: prefer importing from this module instead of reading
 * `process.env.NEXT_PUBLIC_APP_URL` directly. The helper guarantees:
 *   - canonical host is always `https://fitstreak.ru`
 *   - the temporary `*.vercel.app` host (preview / pre-domain) is
 *     transparently rewritten to the production URL so we never leak
 *     it into sitemaps, OG cards, canonical links or emails.
 *
 * Override via `NEXT_PUBLIC_SITE_URL` if you ever need a different
 * canonical (staging, local tunnel, etc.). `NEXT_PUBLIC_APP_URL` is
 * still respected for backwards compatibility but a *.vercel.app value
 * is always normalized to the canonical domain.
 */

const CANONICAL = "https://fitstreak.ru";

function resolveSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    CANONICAL;
  const trimmed = raw.replace(/\/$/, "");
  // Never let a generated *.vercel.app preview URL appear in canonical
  // metadata. We pin to the production domain regardless of where the
  // build runs.
  if (/\.vercel\.app$/i.test(new URL(trimmed).host)) {
    return CANONICAL;
  }
  return trimmed;
}

export const siteConfig = {
  name: "FitStreak",
  shortName: "FitStreak",
  url: resolveSiteUrl(),
  canonicalHost: "fitstreak.ru",
  locale: {
    default: "ru_RU",
    alternates: ["en_US"] as const,
  },
  description: {
    ru: "FitStreak — социальная платформа ежедневной активности. Серия дней, челленджи и рейтинги. Простой трекер привычек, сильная мотивация и живое сообщество.",
    en: "FitStreak — a social platform for daily activity. Streaks, challenges and leaderboards. A simple habit tracker with strong motivation and a real community.",
  },
  tagline: {
    ru: "Серия. Каждый день. Без оправданий.",
    en: "Streak. Show up. Every day.",
  },
  keywords: [
    "fitstreak",
    "fitness streak",
    "habit tracker",
    "fitness challenges",
    "daily activity tracker",
    "streak fitness app",
    "leaderboard fitness",
    "push-up tracker",
    "running streak",
    "трекер привычек",
    "ежедневная активность",
    "фитнес челленджи",
    "серия тренировок",
    "приложение для серии",
    "лидерборд фитнес",
    "энергия очки фитнес",
    "мотивация для тренировок",
    "социальный фитнес",
  ],
  authors: [{ name: "FitStreak Team", url: "https://fitstreak.ru" }],
  publisher: "FitStreak",
  contact: {
    support: "support@fitstreak.ru",
    privacy: "privacy@fitstreak.ru",
    security: "security@fitstreak.ru",
    jobs: "jobs@fitstreak.ru",
  },
  social: {
    twitter: "@fitstreak_app",
    telegram: "https://t.me/fitstreak",
    instagram: "https://instagram.com/fitstreak.app",
  },
  // Drop the verification codes you receive from each tool. Empty
  // string disables the meta tag, so it's safe to ship as-is.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
    yandex: process.env.YANDEX_SITE_VERIFICATION ?? "",
    bing: process.env.BING_SITE_VERIFICATION ?? "",
  },
} as const;

/**
 * Build a fully qualified URL on top of the canonical site URL.
 *
 *   absoluteUrl("/pricing")  →  "https://fitstreak.ru/pricing"
 *   absoluteUrl("pricing")   →  "https://fitstreak.ru/pricing"
 *   absoluteUrl("/")         →  "https://fitstreak.ru"
 */
export function absoluteUrl(path: string = "/"): string {
  if (!path || path === "/") return siteConfig.url;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean}`;
}

export type SiteConfig = typeof siteConfig;
