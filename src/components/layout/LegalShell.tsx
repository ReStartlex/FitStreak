"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface LegalShellProps {
  /** Page title — large display heading. */
  title: string;
  /** Subtitle/eyebrow above the title. */
  eyebrow?: string;
  /** Descriptive lede shown below the title. */
  intro?: React.ReactNode;
  /** Last-updated date label, e.g. "Updated April 2026". */
  updated?: string;
  /** Page body — already-rendered React (use the <Prose> helper). */
  children: React.ReactNode;
}

/**
 * Reusable shell for static / legal-style pages (about, privacy,
 * terms, careers...). Keeps the brand chrome consistent and
 * provides a "Back" link, gradient backdrop, and a typographic
 * column matched to the rest of the site.
 */
export function LegalShell({
  title,
  eyebrow,
  intro,
  updated,
  children,
}: LegalShellProps) {
  const { locale } = useI18n();
  return (
    <>
      <Header />
      <main className="container py-10 sm:py-14 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-6"
        >
          <ArrowLeft className="size-3.5" />
          {locale === "ru" ? "На главную" : "Back to home"}
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 sm:mb-10"
        >
          {eyebrow ? (
            <div className="text-xs uppercase tracking-widest text-lime/80 mb-3">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
            {title}
          </h1>
          {intro ? (
            <p className="text-base sm:text-lg text-ink-dim mt-4 leading-relaxed">
              {intro}
            </p>
          ) : null}
          {updated ? (
            <p className="text-xs text-ink-muted mt-4">{updated}</p>
          ) : null}
        </motion.header>

        <Prose>{children}</Prose>
      </main>
      <Footer />
    </>
  );
}

/**
 * Typography wrapper that gives long-form text consistent rhythm
 * across legal/static pages. Uses raw Tailwind so we don't pull
 * @tailwindcss/typography for one use case.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <article
      className={[
        "text-sm sm:text-base leading-relaxed text-ink-dim",
        "[&_h2]:font-display [&_h2]:text-xl [&_h2]:sm:text-2xl",
        "[&_h2]:font-semibold [&_h2]:text-ink",
        "[&_h2]:mt-10 [&_h2]:mb-4",
        "[&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-3",
        "[&_p]:my-4",
        "[&_ul]:my-4 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-lime/60",
        "[&_ol]:my-4 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:marker:text-lime/60",
        "[&_li]:my-1.5",
        "[&_a]:text-lime [&_a]:underline-offset-4 hover:[&_a]:underline",
        "[&_strong]:text-ink [&_strong]:font-semibold",
        "[&_code]:bg-white/[0.05] [&_code]:px-1.5 [&_code]:py-0.5",
        "[&_code]:rounded [&_code]:border [&_code]:border-line",
        "[&_code]:text-xs [&_code]:font-mono",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-lime/40",
        "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-muted",
        "[&_hr]:border-line [&_hr]:my-10",
      ].join(" ")}
    >
      {children}
    </article>
  );
}
