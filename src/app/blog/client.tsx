"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n/provider";
import { listPosts } from "./posts";

const TONE_BG: Record<string, string> = {
  lime: "bg-gradient-to-br from-lime/20 to-lime/5 border-lime/20",
  violet: "bg-gradient-to-br from-violet/20 to-violet/5 border-violet/20",
  rose: "bg-gradient-to-br from-accent-rose/20 to-accent-rose/5 border-accent-rose/20",
  cyan: "bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/20",
  orange: "bg-gradient-to-br from-accent-orange/20 to-accent-orange/5 border-accent-orange/20",
};

export default function BlogIndexClient() {
  const { locale } = useI18n();
  const ru = locale === "ru";
  const posts = listPosts();

  return (
    <>
      <Header />
      <main className="container py-10 sm:py-14">
        <div className="max-w-2xl mb-10">
          <div className="text-xs uppercase tracking-widest text-lime/80 mb-3">
            {ru ? "Блог" : "Blog"}
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
            {ru
              ? "Истории, идеи, цифры из FitStreak"
              : "Stories, ideas, numbers from FitStreak"}
          </h1>
          <p className="text-base sm:text-lg text-ink-dim mt-4">
            {ru
              ? "Как мы делаем продукт, что узнали о привычках и спорте, и почему серия — это нечто большее, чем число."
              : "How we build the product, what we learn about habits and sports, and why a streak is more than a number."}
          </p>
        </div>

        <ul className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <motion.li
              key={p.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                href={`/blog/${p.slug}`}
                className="surface block h-full p-5 sm:p-6 hover:bg-white/[0.04] transition-colors"
              >
                <div
                  className={
                    "aspect-[16/10] rounded-xl border grid place-items-center text-5xl mb-4 " +
                    (TONE_BG[p.cover.tone] ?? TONE_BG.lime)
                  }
                  aria-hidden="true"
                >
                  <span>{p.cover.emoji}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-muted mb-2">
                  <span>
                    {new Date(p.date).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="opacity-60">·</span>
                  <Clock className="size-3" />
                  <span>
                    {p.readingMinutes} {ru ? "мин" : "min read"}
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold leading-snug mb-2">
                  {p.title[locale]}
                </h2>
                <p className="text-sm text-ink-dim line-clamp-3">
                  {p.excerpt[locale]}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-lime">
                  {ru ? "Читать" : "Read more"}
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
