import type { MetadataRoute } from "next";
import { listPosts } from "./blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fitstreak.ru";
  const now = new Date();

  // Marketing/static surface — what crawlers actually want to index.
  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "daily" },
    { path: "/pricing", priority: 0.8, freq: "weekly" },
    { path: "/challenges", priority: 0.8, freq: "weekly" },
    { path: "/leaderboard", priority: 0.7, freq: "daily" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/blog", priority: 0.7, freq: "weekly" },
    { path: "/careers", priority: 0.5, freq: "monthly" },
    { path: "/contact", priority: 0.5, freq: "monthly" },
    { path: "/privacy", priority: 0.4, freq: "yearly" },
    { path: "/terms", priority: 0.4, freq: "yearly" },
    { path: "/signin", priority: 0.5, freq: "yearly" },
    { path: "/signup", priority: 0.5, freq: "yearly" },
  ];

  const main: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const posts: MetadataRoute.Sitemap = listPosts().map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...main, ...posts];
}
