"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Clock } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useI18n } from "@/lib/i18n/provider";
import { CHALLENGES } from "@/lib/mock/challenges";
import { formatNumber } from "@/lib/format";

export function ChallengesShowcase() {
  const { t, locale } = useI18n();
  const featured = CHALLENGES.slice(0, 4);

  return (
    <Section
      eyebrow={t.landing.challengesEyebrow}
      title={t.landing.challengesTitle}
      subtitle={t.landing.challengesSubtitle}
    >
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((c, idx) => {
          const tone = {
            lime: "from-lime/25 to-transparent",
            violet: "from-violet/25 to-transparent",
            rose: "from-accent-rose/25 to-transparent",
            cyan: "from-accent-cyan/25 to-transparent",
            orange: "from-accent-orange/25 to-transparent",
          }[c.tone];
          const progressTone =
            c.tone === "violet" ? "violet" : c.tone === "rose" ? "rose" : c.tone === "cyan" ? "cyan" : "lime";

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="surface p-5 flex flex-col gap-4 relative overflow-hidden hover:border-line-strong transition-colors"
            >
              <div
                className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${tone} opacity-50 pointer-events-none`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="text-3xl">{c.badge}</div>
                <Badge variant="outline">
                  {c.type === "personal"
                    ? locale === "ru"
                      ? "Личный"
                      : "Personal"
                    : c.type === "friends"
                      ? locale === "ru"
                        ? "Дружеский"
                        : "Friends"
                      : locale === "ru"
                        ? "Публичный"
                        : "Public"}
                </Badge>
              </div>
              <div className="relative">
                <h3 className="font-display text-base font-semibold tracking-tight">
                  {locale === "ru" ? c.titleRu : c.titleEn}
                </h3>
                <p className="text-xs text-ink-dim mt-1.5 line-clamp-2">
                  {locale === "ru" ? c.descRu : c.descEn}
                </p>
              </div>
              <div className="relative flex flex-col gap-2 mt-auto">
                <div className="flex items-center justify-between text-xs text-ink-dim">
                  <span className="number-tabular text-ink">
                    {formatNumber(c.progress, locale)} / {formatNumber(c.goal, locale)}{" "}
                    {locale === "ru" ? c.unitRu : c.unitEn}
                  </span>
                  <span className="number-tabular">
                    {Math.round((c.progress / c.goal) * 100)}%
                  </span>
                </div>
                <Progress
                  value={c.progress}
                  max={c.goal}
                  tone={progressTone as "lime" | "violet" | "rose" | "cyan"}
                  size="sm"
                />
                <div className="flex items-center justify-between text-xs text-ink-muted mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" />
                    {formatNumber(c.participants, locale)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {c.endsInHours}
                    {locale === "ru" ? "ч" : "h"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/challenges">
          <Button variant="secondary" size="lg" className="gap-2">
            {t.common.seeAll}
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </Section>
  );
}
