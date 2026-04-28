"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { Prose } from "@/components/layout/LegalShell";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n/provider";
import { getPost, listPosts } from "../posts";

const TONE_BG: Record<string, string> = {
  lime: "bg-gradient-to-br from-lime/20 to-lime/5 border-lime/20",
  violet: "bg-gradient-to-br from-violet/20 to-violet/5 border-violet/20",
  rose: "bg-gradient-to-br from-accent-rose/20 to-accent-rose/5 border-accent-rose/20",
  cyan: "bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/20",
  orange: "bg-gradient-to-br from-accent-orange/20 to-accent-orange/5 border-accent-orange/20",
};

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const { locale } = useI18n();
  const ru = locale === "ru";
  const post = getPost(params.slug);
  if (!post) {
    notFound();
  }

  // Two extra posts to recommend at the bottom.
  const others = listPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      <Header />
      <main className="container py-10 sm:py-14 max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-6"
        >
          <ArrowLeft className="size-3.5" />
          {ru ? "Все статьи" : "All posts"}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className={
              "aspect-[16/8] rounded-2xl border grid place-items-center text-7xl mb-6 " +
              (TONE_BG[post.cover.tone] ?? TONE_BG.lime)
            }
            aria-hidden="true"
          >
            <span>{post.cover.emoji}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-muted mb-3">
            <span>
              {new Date(post.date).toLocaleDateString(locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="opacity-60">·</span>
            <Clock className="size-3" />
            <span>
              {post.readingMinutes} {ru ? "минут чтения" : "min read"}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-4">
            {post.title[locale]}
          </h1>
          <p className="text-base sm:text-lg text-ink-dim mb-8 leading-relaxed">
            {post.excerpt[locale]}
          </p>
        </motion.div>

        <Prose>{post.body[locale]}</Prose>

        {others.length > 0 ? (
          <section className="mt-14 pt-8 border-t border-line">
            <h2 className="font-display text-base font-semibold mb-4">
              {ru ? "Читать дальше" : "Keep reading"}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="surface block p-4 rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="text-xs text-ink-muted mb-1">
                      {new Date(p.date).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="text-sm font-medium leading-snug">
                      {p.title[locale]}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
