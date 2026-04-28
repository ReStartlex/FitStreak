"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Clock, Trophy } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/provider";
import { CHALLENGES } from "@/lib/mock/challenges";
import { formatNumber } from "@/lib/format";

interface ApiChallenge {
  id: string;
  slug: string;
  title: { ru: string; en: string };
  description: { ru: string; en: string };
  metric: string;
  goal: number;
  durationDays: number;
  difficulty: string;
  participantsCount: number;
  isFeatured: boolean;
  type: "PUBLIC" | "FRIENDS" | "PERSONAL";
  endsAt: string | null;
  rewardXp: number;
}

const TONE_BY_INDEX = ["lime", "violet", "rose", "cyan"] as const;
const BADGE_BY_INDEX = ["💪", "🏃", "🧘", "🔥"] as const;

export function ChallengesShowcase() {
  const { t, locale } = useI18n();
  const [items, setItems] = React.useState<ApiChallenge[] | null>(null);

  React.useEffect(() => {
    fetch("/api/challenges", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const list = (j?.challenges as ApiChallenge[] | undefined) ?? [];
        const publicOnly = list
          .filter((c) => c.type === "PUBLIC")
          .slice(0, 4);
        setItems(publicOnly);
      })
      .catch(() => setItems([]));
  }, []);

  // While loading or if seed/db has no public challenges yet,
  // fall back to the polished mock so the landing never looks empty.
  const list: Array<{
    id: string;
    slug?: string;
    title: string;
    description: string;
    metric: string;
    goal: number;
    durationDays: number;
    participantsCount: number;
    rewardXp: number;
    badge: string;
    tone: "lime" | "violet" | "rose" | "cyan";
    isReal: boolean;
    endsInHours: number | null;
  }> = (items && items.length > 0
    ? items.map((c, i) => ({
        id: c.id,
        slug: c.slug,
        title: locale === "ru" ? c.title.ru : c.title.en,
        description: locale === "ru" ? c.description.ru : c.description.en,
        metric: c.metric,
        goal: c.goal,
        durationDays: c.durationDays,
        participantsCount: c.participantsCount,
        rewardXp: c.rewardXp,
        badge: BADGE_BY_INDEX[i % BADGE_BY_INDEX.length],
        tone: TONE_BY_INDEX[i % TONE_BY_INDEX.length],
        isReal: true,
        endsInHours: c.endsAt
          ? Math.max(
              0,
              Math.round(
                (new Date(c.endsAt).getTime() - Date.now()) / 3_600_000,
              ),
            )
          : null,
      }))
    : CHALLENGES.slice(0, 4).map((c) => ({
        id: c.id,
        title: locale === "ru" ? c.titleRu : c.titleEn,
        description: locale === "ru" ? c.descRu : c.descEn,
        metric: locale === "ru" ? c.unitRu : c.unitEn,
        goal: c.goal,
        durationDays: Math.max(1, Math.round(c.endsInHours / 24)),
        participantsCount: c.participants,
        rewardXp: 0,
        badge: c.badge,
        tone: (c.tone === "orange" ? "lime" : c.tone) as
          | "lime"
          | "violet"
          | "rose"
          | "cyan",
        isReal: false,
        endsInHours: c.endsInHours,
      })));

  return (
    <Section
      eyebrow={t.landing.challengesEyebrow}
      title={t.landing.challengesTitle}
      subtitle={t.landing.challengesSubtitle}
    >
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((c, idx) => {
          const tone = {
            lime: "from-lime/25 to-transparent",
            violet: "from-violet/25 to-transparent",
            rose: "from-accent-rose/25 to-transparent",
            cyan: "from-accent-cyan/25 to-transparent",
          }[c.tone];

          const card = (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="surface p-5 flex flex-col gap-4 relative overflow-hidden hover:border-line-strong transition-colors h-full"
            >
              <div
                className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${tone} opacity-50 pointer-events-none`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="text-3xl">{c.badge}</div>
                <Badge variant="outline">
                  {locale === "ru" ? "Публичный" : "Public"}
                </Badge>
              </div>
              <div className="relative">
                <h3 className="font-display text-base font-semibold tracking-tight">
                  {c.title}
                </h3>
                <p className="text-xs text-ink-dim mt-1.5 line-clamp-2">
                  {c.description}
                </p>
              </div>
              <div className="relative flex flex-col gap-2 mt-auto">
                <div className="flex items-center justify-between text-xs text-ink-dim">
                  <span className="number-tabular text-ink">
                    {formatNumber(c.goal, locale)}{" "}
                    <span className="text-ink-muted">
                      {c.metric.toString().toLowerCase()}
                    </span>
                  </span>
                  <span className="number-tabular text-ink-muted">
                    {c.durationDays}
                    {locale === "ru" ? "д" : "d"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-ink-muted mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" />
                    {formatNumber(c.participantsCount, locale)}
                  </span>
                  {c.rewardXp > 0 ? (
                    <span className="inline-flex items-center gap-1 text-lime">
                      <Trophy className="size-3" />+{c.rewardXp} XP
                    </span>
                  ) : c.endsInHours != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {c.endsInHours}
                      {locale === "ru" ? "ч" : "h"}
                    </span>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );

          return c.isReal && c.slug ? (
            <Link href={`/challenges/${c.slug}`} key={c.id} className="block">
              {card}
            </Link>
          ) : (
            <div key={c.id}>{card}</div>
          );
        })}
      </div>

      <div className="mt-8 sm:mt-10 flex justify-center">
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
