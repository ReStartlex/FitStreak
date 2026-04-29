import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  JsonLd,
  blogPostingSchema,
  breadcrumbSchema,
} from "@/lib/seo/jsonld";
import { absoluteUrl } from "@/lib/site";
import { getPost, listPosts } from "../posts";
import BlogPostClient from "./client";

interface Params {
  slug: string;
}

export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return buildMetadata({
      title: "Запись не найдена",
      description: "Эта статья FitStreak больше недоступна.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: post.title.ru,
    description: post.excerpt.ru,
    path: `/blog/${post.slug}`,
    ogType: "article",
    publishedTime: post.date,
    modifiedTime: post.date,
    keywords: [
      ...post.title.ru.split(/\s+/).filter((w) => w.length > 3),
      "fitstreak",
      "блог",
      "fitness",
      "habits",
    ],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        id="ld-post-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Блог", url: "/blog" },
          { name: post.title.ru, url: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd
        id="ld-post-article"
        data={blogPostingSchema({
          slug: post.slug,
          title: post.title.ru,
          description: post.excerpt.ru,
          datePublished: post.date,
          image: absoluteUrl("/opengraph-image"),
        })}
      />
      <BlogPostClient slug={slug} />
    </>
  );
}
