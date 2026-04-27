"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";

export function CtaBanner() {
  const { t } = useI18n();

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-line bg-bg-card p-8 sm:p-14 text-center"
        >
          <div className="absolute inset-0 bg-radial-lime opacity-70" />
          <div className="absolute inset-0 bg-radial-violet opacity-50" />
          <div className="absolute inset-0 grid-bg opacity-40 mask-fade-b" />

          <div className="relative flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <span className="chip">
              <Sparkles className="size-3.5 text-lime" />
              {t.brand.tagline}
            </span>
            <h2 className="text-display-md sm:text-display-lg text-balance">
              {t.landing.ctaTitle}
            </h2>
            <p className="text-base sm:text-lg text-ink-dim text-balance">
              {t.landing.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  {t.landing.ctaButton}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="lg" variant="outline">
                  {t.landing.ctaSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
