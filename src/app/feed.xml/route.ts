import { NextResponse } from "next/server";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { listPosts } from "@/app/blog/posts";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * Atom-style RSS 2.0 feed for the blog. We keep the markup minimal —
 * no body content (since posts are React) — and link out to the
 * full-fidelity HTML page where the real content lives. That's enough
 * for Feedly / NetNewsWire / RSS readers and for Google to discover
 * the canonical page.
 */
export function GET() {
  const posts = listPosts();
  const lastBuilt = new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/blog/${p.slug}`);
      const pubDate = new Date(p.date).toUTCString();
      return `    <item>
      <title>${escape(p.title.ru)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escape(p.excerpt.ru)}</description>
      <author>noreply@fitstreak.ru (${escape(siteConfig.publisher)})</author>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.name)} — Blog</title>
    <link>${absoluteUrl("/blog")}</link>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>${escape(siteConfig.description.ru)}</description>
    <language>ru-RU</language>
    <copyright>© ${new Date().getFullYear()} ${escape(siteConfig.publisher)}</copyright>
    <lastBuildDate>${lastBuilt}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
