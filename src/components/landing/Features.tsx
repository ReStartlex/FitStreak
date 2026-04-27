"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Flame,
  MousePointerClick,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Section } from "@/components/ui/Section";

export function Features() {
  const { t } = useI18n();

  const items = [
    {
      icon: MousePointerClick,
      title: t.landing.featureQuickTitle,
      desc: t.landing.featureQuickDesc,
      tone: "lime" as const,
    },
    {
      icon: Flame,
      title: t.landing.featureStreakTitle,
      desc: t.landing.featureStreakDesc,
      tone: "rose" as const,
    },
    {
      icon: Swords,
      title: t.landing.featureChallengeTitle,
      desc: t.landing.featureChallengeDesc,
      tone: "violet" as const,
    },
    {
      icon: Trophy,
      title: t.landing.featureLeaderTitle,
      desc: t.landing.featureLeaderDesc,
      tone: "lime" as const,
    },
    {
      icon: Bell,
      title: t.landing.featureReminderTitle,
      desc: t.landing.featureReminderDesc,
      tone: "cyan" as const,
    },
    {
      icon: Users,
      title: t.landing.featureCommunityTitle,
      desc: t.landing.featureCommunityDesc,
      tone: "violet" as const,
    },
  ];

  return (
    <Section
      eyebrow={t.landing.featuresEyebrow}
      title={t.landing.featuresTitle}
      subtitle={t.landing.featuresSubtitle}
    >
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, idx) => (
          <FeatureCard key={idx} index={idx} {...it} />
        ))}
      </div>
    </Section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  tone,
  index,
}: {
  icon: typeof Flame;
  title: string;
  desc: string;
  tone: "lime" | "violet" | "rose" | "cyan";
  index: number;
}) {
  const toneStyles = {
    lime: { iconBg: "bg-lime/15 text-lime border-lime/30", glow: "from-lime/30" },
    violet: { iconBg: "bg-violet/15 text-violet-soft border-violet/30", glow: "from-violet/30" },
    rose: { iconBg: "bg-accent-rose/15 text-accent-rose border-accent-rose/30", glow: "from-accent-rose/30" },
    cyan: { iconBg: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30", glow: "from-accent-cyan/30" },
  } as const;
  const s = toneStyles[tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative surface p-6 overflow-hidden hover:border-line-strong transition-colors"
    >
      <div
        className={`absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br ${s.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`}
      />
      <div className="relative flex flex-col gap-4">
        <div
          className={`size-11 grid place-items-center rounded-xl border ${s.iconBg}`}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-sm text-ink-dim leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.article>
  );
}
