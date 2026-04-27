"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { useI18n } from "@/lib/i18n/provider";
import { TESTIMONIALS } from "@/lib/mock/testimonials";

export function Testimonials() {
  const { t, locale } = useI18n();

  return (
    <Section
      eyebrow={t.landing.testimonialsEyebrow}
      title={t.landing.testimonialsTitle}
      subtitle={t.landing.testimonialsSubtitle}
    >
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((tst, i) => (
          <motion.figure
            key={tst.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="surface p-6 flex flex-col gap-4 relative overflow-hidden"
          >
            <Quote className="size-7 text-lime/40" />
            <blockquote className="text-sm leading-relaxed text-ink/90">
              {locale === "ru" ? tst.textRu : tst.textEn}
            </blockquote>
            <figcaption className="flex items-center gap-3 mt-auto pt-3 border-t border-line">
              <Avatar name={tst.name} size={36} tone="default" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{tst.name}</span>
                <span className="text-xs text-ink-muted">{tst.handle}</span>
              </div>
              <div className="ml-auto text-xs text-lime number-tabular font-medium">
                {locale === "ru" ? tst.metricRu : tst.metricEn}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}
