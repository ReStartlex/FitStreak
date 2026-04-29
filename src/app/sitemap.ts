import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { listPosts } from "./blog/posts";

/**
 * Build the sitemap entirely off the canonical site URL — the helper
 * pins the host to `https://fitstreak.ru` even when running on a
 * preview deployment, so we never leak vercel.app URLs to crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    freq: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, freq: "daily" },
    { path: "/pricing", priority: 0.9, freq: "weekly" },
    { path: "/challenges", priority: 0.8, freq: "daily" },
    { path: "/leaderboard", priority: 0.7, freq: "daily" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/blog", priority: 0.8, freq: "weekly" },
    { path: "/careers", priority: 0.5, freq: "monthly" },
    { path: "/contact", priority: 0.5, freq: "monthly" },
    { path: "/privacy", priority: 0.3, freq: "yearly" },
    { path: "/terms", priority: 0.3, freq: "yearly" },
    { path: "/signin", priority: 0.4, freq: "yearly" },
    { path: "/signup", priority: 0.6, freq: "yearly" },
  ];

  const main: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
    alternates: {
      languages: {
        "ru-RU": absoluteUrl(r.path),
        "en-US": absoluteUrl(r.path),
        "x-default": absoluteUrl(r.path),
      },
    },
  }));

  const posts: MetadataRoute.Sitemap = listPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: {
      languages: {
        "ru-RU": absoluteUrl(`/blog/${p.slug}`),
        "en-US": absoluteUrl(`/blog/${p.slug}`),
        "x-default": absoluteUrl(`/blog/${p.slug}`),
      },
    },
  }));

  return [...main, ...posts];
}
