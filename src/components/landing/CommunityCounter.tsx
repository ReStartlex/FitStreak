"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/provider";
import { COMMUNITY_TODAY, COMMUNITY_TOTAL_TODAY } from "@/lib/mock/community";
import { EXERCISES } from "@/lib/mock/exercises";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Section } from "@/components/ui/Section";
import { TrendingUp } from "lucide-react";

export function CommunityCounter() {
  const { t, locale } = useI18n();

  return (
    <Section
      eyebrow={t.common.live}
      title={t.landing.communityTitle}
      subtitle={t.landing.communitySubtitle}
      align="center"
    >
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COMMUNITY_TODAY.map((stat, idx) => {
          const ex = EXERCISES.find((e) => e.id === stat.exerciseId);
          if (!ex) return null;
          const Icon = ex.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="relative surface p-5 sm:p-6 overflow-hidden group"
            >
              <div className="absolute -right-6 -top-6 size-32 rounded-full bg-lime/8 blur-2xl group-hover:bg-lime/12 transition-colors" />
              <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="grid place-items-center size-10 rounded-xl border border-line bg-white/[0.04]">
                    <Icon className="size-5 text-lime" />
                  </div>
                  <div className="inline-flex items-center gap-1 text-success text-xs font-medium">
                    <TrendingUp className="size-3.5" />+{stat.change24h}%
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl sm:text-4xl font-bold tracking-tight number-tabular">
                    <AnimatedNumber value={stat.value} locale={locale} />
                  </div>
                  <div className="text-sm text-ink-dim mt-1">
                    {locale === "ru" ? ex.nameRu : ex.nameEn}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 surface p-6 sm:p-8 grid gap-6 sm:grid-cols-[1fr_auto] items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
            {t.landing.communityTitle}
          </div>
          <div className="font-display text-display-md text-gradient-lime number-tabular">
            <AnimatedNumber value={COMMUNITY_TOTAL_TODAY} locale={locale} />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:border-l sm:border-line sm:pl-8">
          <div className="size-10 grid place-items-center rounded-xl bg-lime-gradient text-bg shadow-glow">
            <TrendingUp className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-ink-muted uppercase tracking-widest">
              {t.landing.communityYouContrib}
            </span>
            <span className="text-lg font-semibold number-tabular">
              <AnimatedNumber value={1240} locale={locale} />{" "}
              <span className="text-ink-dim text-sm">{t.common.reps}</span>
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}
