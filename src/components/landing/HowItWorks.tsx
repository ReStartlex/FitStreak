"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/lib/i18n/provider";

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { title: t.landing.howStep1, desc: t.landing.howStep1Desc },
    { title: t.landing.howStep2, desc: t.landing.howStep2Desc },
    { title: t.landing.howStep3, desc: t.landing.howStep3Desc },
    { title: t.landing.howStep4, desc: t.landing.howStep4Desc },
    { title: t.landing.howStep5, desc: t.landing.howStep5Desc },
  ];

  return (
    <Section
      eyebrow={t.landing.howEyebrow}
      title={t.landing.howTitle}
      align="center"
    >
      <div className="relative">
        {/* Vertical line for mobile */}
        <div className="absolute left-5 top-2 bottom-2 w-px bg-line lg:hidden" />
        {/* Horizontal line for desktop */}
        <div className="hidden lg:block absolute top-8 left-12 right-12 h-px bg-line" />

        <ol className="grid gap-6 lg:grid-cols-5">
          {steps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="relative pl-14 lg:pl-0 lg:flex lg:flex-col lg:items-center lg:text-center"
            >
              <div className="absolute left-0 top-0 lg:static lg:mb-4 size-10 grid place-items-center rounded-full bg-lime-gradient text-bg font-display font-bold shadow-glow">
                {i + 1}
              </div>
              <h3 className="font-display text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-dim">{s.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
