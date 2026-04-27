"use client";

import { motion } from "framer-motion";
import { Crown, ArrowUp, ArrowDown, Swords } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/provider";
import { LEADERS_DAY } from "@/lib/mock/leaderboard";
import { formatNumber } from "@/lib/format";

export function SocialShowcase() {
  const { t, locale } = useI18n();
  const top = LEADERS_DAY.slice(0, 5);
  const around = LEADERS_DAY.slice(10, 14);

  return (
    <Section
      eyebrow={t.landing.socialEyebrow}
      title={t.landing.socialTitle}
      subtitle={t.landing.socialSubtitle}
    >
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Top leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="surface p-5 sm:p-6 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 size-72 rounded-full bg-lime/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="size-4 text-lime" />
                <span className="text-xs uppercase tracking-widest text-ink-muted">
                  {t.leaderboard.tabDay}
                </span>
              </div>
              <Badge variant="lime">+{LEADERS_DAY.length}</Badge>
            </div>

            <ul className="flex flex-col gap-1">
              {top.map((row, i) => (
                <LeaderRow key={row.username} row={row} podium={i < 3} index={i} />
              ))}
              <li className="my-2 text-center text-[10px] text-ink-muted tracking-widest uppercase">
                · · ·
              </li>
              {around.map((row, i) => (
                <LeaderRow key={row.username} row={row} podium={false} index={i + top.length} />
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Battle card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="surface p-5 sm:p-6 relative overflow-hidden flex flex-col gap-5"
        >
          <div className="absolute -right-10 -bottom-10 size-72 rounded-full bg-violet/15 blur-3xl" />
          <div className="relative flex items-center gap-2 text-ink-dim text-xs uppercase tracking-widest">
            <Swords className="size-4 text-violet-soft" />
            {locale === "ru" ? "Дуэль 1-на-1" : "1-on-1 duel"}
          </div>

          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Alex Rider" size={64} tone="lime" />
              <span className="text-sm font-semibold">You</span>
              <span className="font-display text-3xl font-bold number-tabular text-gradient-lime">
                124
              </span>
              <span className="text-xs text-ink-muted">
                {locale === "ru" ? "отжимания" : "push-ups"}
              </span>
            </div>
            <div className="grid place-items-center size-12 rounded-full border border-line bg-bg-card text-ink-dim font-display font-bold text-sm">
              VS
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Nikita G" size={64} tone="violet" />
              <span className="text-sm font-semibold">Nikita</span>
              <span className="font-display text-3xl font-bold number-tabular text-gradient-violet">
                118
              </span>
              <span className="text-xs text-ink-muted">
                {locale === "ru" ? "отжимания" : "push-ups"}
              </span>
            </div>
          </div>

          <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden border border-line">
            <div className="absolute inset-y-0 left-0 w-[51%] bg-lime-gradient" />
            <div className="absolute inset-y-0 right-0 w-[49%] bg-violet-gradient opacity-80" />
          </div>

          <div className="relative flex items-center justify-between text-xs text-ink-dim">
            <span>
              {locale === "ru" ? "Осталось" : "Time left"}{" "}
              <span className="text-ink number-tabular">2д 14ч</span>
            </span>
            <span>
              {locale === "ru" ? "Преимущество" : "Lead"}{" "}
              <span className="text-lime number-tabular">+6</span>
            </span>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function LeaderRow({
  row,
  podium,
  index,
}: {
  row: (typeof LEADERS_DAY)[number];
  podium: boolean;
  index: number;
}) {
  const { locale } = useI18n();
  const diff = row.prevRank - row.rank;
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={`flex items-center gap-3 sm:gap-4 rounded-xl px-2 sm:px-3 py-2 transition-colors ${
        row.isYou
          ? "bg-lime/8 border border-lime/30"
          : "hover:bg-white/[0.03]"
      }`}
    >
      <div
        className={`number-tabular w-7 text-center font-display font-bold ${
          podium ? "text-lime text-lg" : "text-ink-muted"
        }`}
      >
        {row.rank}
      </div>
      <Avatar
        name={row.name}
        size={36}
        tone={podium ? "lime" : row.isYou ? "lime" : "default"}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium truncate">
          {row.name}
          {row.isYou && (
            <span className="ml-2 text-xs text-lime">
              {locale === "ru" ? "ты" : "you"}
            </span>
          )}
        </span>
        <span className="text-xs text-ink-muted">@{row.username}</span>
      </div>
      <div className="text-right">
        <div className="font-display font-bold number-tabular">
          {formatNumber(row.reps, locale)}
        </div>
        <div className="text-[10px] text-ink-muted inline-flex items-center gap-0.5 justify-end">
          {diff > 0 ? (
            <>
              <ArrowUp className="size-3 text-success" />
              <span className="text-success">{diff}</span>
            </>
          ) : diff < 0 ? (
            <>
              <ArrowDown className="size-3 text-danger" />
              <span className="text-danger">{Math.abs(diff)}</span>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
    </motion.li>
  );
}
