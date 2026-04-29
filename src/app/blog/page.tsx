import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { listPosts } from "./posts";
import BlogIndexClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Блог FitStreak — истории и идеи о привычках и фитнесе",
  description:
    "Как мы строим продукт, что узнаём о привычках и спорте, и почему серия — это нечто большее, чем число. Свежие материалы команды FitStreak.",
  path: "/blog",
  keywords: [
    "fitstreak блог",
    "fitstreak blog",
    "статьи о привычках",
    "фитнес блог",
    "habit science",
    "streak psychology",
    "fitness streak articles",
  ],
});

export default function BlogIndexPage() {
  const posts = listPosts();
  const blogList = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.name} Blog`,
    url: absoluteUrl("/blog"),
    publisher: { "@id": `${siteConfig.url}#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title.ru,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: p.date,
    })),
  };

  return (
    <>
      <JsonLd
        id="ld-blog-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Блог", url: "/blog" },
        ])}
      />
      <JsonLd id="ld-blog-list" data={blogList} />
      <BlogIndexClient />
    </>
  );
}
