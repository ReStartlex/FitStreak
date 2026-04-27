"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Target, Activity } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Section } from "@/components/ui/Section";
import { Progress } from "@/components/ui/Progress";

export function ProgressShowcase() {
  const { t, locale } = useI18n();

  return (
    <Section
      eyebrow={t.landing.progressEyebrow}
      title={t.landing.progressTitle}
      subtitle={t.landing.progressSubtitle}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="surface p-6 sm:p-8 lg:row-span-2 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 size-72 rounded-full bg-accent-orange/15 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 size-72 rounded-full bg-accent-rose/15 blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-accent-orange animate-flame" />
              <span className="text-xs uppercase tracking-widest text-ink-muted">
                {t.dashboard.streakTitle}
              </span>
            </div>
            <div>
              <div className="font-display text-display-xl text-gradient-lime number-tabular leading-none">
                17
              </div>
              <div className="text-ink-dim mt-2">
                {locale === "ru" ? "дней подряд" : "days in a row"}
              </div>
            </div>

            {/* Mini streak dots */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: 17 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className="size-3 rounded-full bg-lime-gradient shadow-glow"
                />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={`f-${i}`}
                  className="size-3 rounded-full border border-line bg-white/[0.04]"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-xs text-ink-muted">
                  {locale === "ru" ? "Личный рекорд" : "Personal best"}
                </div>
                <div className="font-display text-2xl font-bold mt-1">
                  34{" "}
                  <span className="text-sm text-ink-dim font-sans font-normal">
                    {locale === "ru" ? "д" : "d"}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-muted">
                  {locale === "ru" ? "До рекорда" : "To PR"}
                </div>
                <div className="font-display text-2xl font-bold mt-1">
                  17{" "}
                  <span className="text-sm text-ink-dim font-sans font-normal">
                    {locale === "ru" ? "д" : "d"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily goal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="surface p-6 flex flex-col gap-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink-dim text-sm">
              <Target className="size-4 text-lime" />
              {t.dashboard.progressToGoal}
            </div>
            <span className="text-xs text-ink-muted">69%</span>
          </div>
          <div className="font-display text-4xl font-bold number-tabular">
            138 <span className="text-ink-muted text-base font-sans font-normal">/ 200</span>
          </div>
          <Progress value={138} max={200} tone="lime" size="md" />
          <div className="text-xs text-ink-dim">{t.dashboard.reminderHint}</div>
        </motion.div>

        {/* Best day */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="surface p-6 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 text-ink-dim text-sm">
            <Trophy className="size-4 text-violet-soft" />
            {t.dashboard.statsBestDay}
          </div>
          <div className="font-display text-3xl font-bold number-tabular text-gradient-violet">
            320 <span className="text-base text-ink-dim font-sans font-normal">{t.common.reps}</span>
          </div>
          <div className="text-xs text-ink-muted">
            {locale === "ru" ? "Среда, 14 апреля" : "Wed, Apr 14"}
          </div>
          <div className="mt-2">
            <BarsMini />
          </div>
        </motion.div>

        {/* Weekly stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="surface p-6 lg:col-span-2 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink-dim text-sm">
              <Activity className="size-4 text-accent-cyan" />
              {t.dashboard.statsThisWeek}
            </div>
            <span className="text-xs text-success">+24% vs last</span>
          </div>
          <BigBars />
        </motion.div>
      </div>
    </Section>
  );
}

function BarsMini() {
  const data = [40, 28, 64, 38, 52, 80, 60];
  return (
    <div className="flex items-end gap-1.5 h-12">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${v}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.04 }}
          className="flex-1 rounded-t bg-violet-gradient"
        />
      ))}
    </div>
  );
}

function BigBars() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const daysEn = ["M", "T", "W", "T", "F", "S", "S"];
  const values = [60, 78, 320, 80, 120, 95, 138];
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-2 h-40">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(v / max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="w-full rounded-t-md bg-lime-gradient relative group"
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] number-tabular text-ink-dim opacity-0 group-hover:opacity-100 transition-opacity">
              {v}
            </span>
          </motion.div>
          <span className="text-[10px] text-ink-muted">
            <span className="hidden sm:inline">{days[i]}</span>
            <span className="sm:hidden">{daysEn[i]}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
