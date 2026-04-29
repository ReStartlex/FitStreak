import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * The robots policy is generated from `siteConfig`, so the canonical
 * host (`https://fitstreak.ru`) is what gets advertised to crawlers
 * — never a preview `*.vercel.app` URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/*",
          "/profile",
          "/profile/*",
          "/reminders",
          "/reminders/*",
          "/settings",
          "/settings/*",
          "/onboarding",
          "/onboarding/*",
          "/admin",
          "/admin/*",
          "/verify-email",
          "/forgot-password",
          "/reset-password",
          "/u/*/followers",
          "/u/*/following",
        ],
      },
      // Block bandwidth-heavy AI crawlers from training on the site.
      // They can still hit /robots.txt and pages that reference them.
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.canonicalHost,
  };
}
