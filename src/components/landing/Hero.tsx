"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Play, Sparkles, TrendingUp, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useCommunityStats } from "@/lib/hooks/use-community-stats";
import { formatCompact } from "@/lib/format";

export function Hero() {
  const { t, locale } = useI18n();
  const { data: stats } = useCommunityStats();
  const repsToday = stats?.today.totalAmount ?? 0;
  const lifetimeEnergy = stats?.lifetime.totalEnergy ?? 0;
  const activeUsers = stats?.community.activeUsers30d ?? 0;

  return (
    <section className="relative pt-8 sm:pt-16 pb-14 sm:pb-24 lg:pb-28 overflow-hidden">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-radial-violet" />
        <div className="absolute inset-0 bg-radial-lime" />
        <div className="absolute inset-0 grid-bg mask-fade-b opacity-50" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 sm:gap-10 lg:gap-14 items-center">
          {/* Left */}
          <div className="flex flex-col gap-5 sm:gap-7">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="chip self-start"
            >
              <span className="size-1.5 rounded-full bg-lime animate-pulse-soft" />
              {t.landing.heroEyebrow}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-display-lg sm:text-display-xl text-balance"
            >
              <span className="block">{t.landing.heroTitle1}</span>
              <span className="block">
                <span className="text-gradient-lime">{t.landing.heroTitle2}</span>
              </span>
              <span className="block text-ink-dim">{t.landing.heroTitle3}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="text-base sm:text-lg text-ink-dim max-w-xl text-balance"
            >
              {t.landing.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Zap className="size-5" />
                  {t.landing.heroPrimaryCta}
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                  <Play className="size-4" />
                  {t.landing.heroSecondaryCta}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["#FF8A4C", "#7C5CFF", "#3DE0FF", "#C6FF3D"].map((c, i) => (
                    <div
                      key={i}
                      className="size-7 rounded-full border-2 border-bg"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <span className="text-sm text-ink-dim">
                  <span className="text-ink font-semibold number-tabular">
                    {activeUsers > 0
                      ? formatCompact(activeUsers, locale)
                      : "—"}
                  </span>{" "}
                  {locale === "ru"
                    ? "активны за 30 дней"
                    : "active in last 30 days"}
                </span>
              </div>
              <div className="text-sm text-ink-dim">
                <span className="text-gradient-lime font-display font-bold text-lg number-tabular">
                  <AnimatedNumber value={repsToday} locale={locale} />
                </span>{" "}
                {locale === "ru"
                  ? "повторений сегодня"
                  : "reps logged today"}
              </div>
              <div className="text-sm text-ink-dim">
                <span className="text-gradient-lime font-display font-bold text-lg number-tabular">
                  {lifetimeEnergy > 0
                    ? formatCompact(lifetimeEnergy, locale)
                    : "—"}
                </span>{" "}
                {t.scoring.energyShort} ·{" "}
                {locale === "ru" ? "общий счёт" : "lifetime"}
              </div>
            </motion.div>
          </div>

          {/* Right – product mock */}
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  const { t, locale } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25 }}
      className="relative"
    >
      {/* Floating chips */}
      <FloatingChip
        className="left-2 -top-4 sm:-top-6"
        delay={0.6}
        tone="lime"
        icon={<Flame className="size-3.5" />}
        text={t.landing.heroBadgeStreak}
      />
      <FloatingChip
        className="right-2 top-1/3"
        delay={0.9}
        tone="violet"
        icon={<TrendingUp className="size-3.5" />}
        text={t.landing.heroBadgeRank}
      />
      <FloatingChip
        className="-left-2 bottom-12"
        delay={1.1}
        tone="rose"
        icon={<Sparkles className="size-3.5" />}
        text={t.landing.heroBadgeReps}
      />

      {/* Phone mock */}
      <div className="relative mx-auto w-full max-w-[420px]">
        <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-lime/30 via-violet/20 to-transparent blur-3xl" />

        <div className="relative rounded-[2.2rem] border border-line-strong bg-bg-card/80 p-3 shadow-soft backdrop-blur-2xl">
          <div className="rounded-[1.6rem] border border-line bg-bg-soft/80 p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-ink-muted uppercase tracking-widest">
                  {t.dashboard.todayTitle}
                </span>
                <span className="font-display text-xl font-semibold mt-1">
                  {locale === "ru" ? "Привет, Алекс" : "Hi, Alex"}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-line bg-bg/60 px-3 py-1.5">
                <Flame className="size-4 text-accent-orange animate-flame" />
                <span className="text-sm font-semibold number-tabular">17</span>
                <span className="text-xs text-ink-dim">
                  {locale === "ru" ? "д" : "d"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs text-ink-muted mb-1.5">
                {t.scoring.energyScore} · {t.dashboard.progressToGoal}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold tracking-tight text-gradient-lime number-tabular">
                  286
                </span>
                <span className="text-ink-muted text-sm">/ 400 {t.scoring.energyShort}</span>
              </div>
              <div className="mt-3 h-3 rounded-full overflow-hidden bg-white/[0.06] border border-line">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "71%" }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="h-full bg-lime-gradient shadow-glow"
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-muted">
                <span className="rounded-full border border-violet/40 bg-violet/15 text-violet-soft font-display font-semibold px-2 py-0.5">
                  lv 14
                </span>
                <span className="rounded-full border border-lime/40 bg-lime/15 text-lime font-display font-semibold px-2 py-0.5">
                  +412 XP
                </span>
                <span className="rounded-full border border-accent-orange/40 bg-accent-orange/15 text-accent-orange font-display font-semibold px-2 py-0.5">
                  ≈ 348 {locale === "ru" ? "ккал" : "kcal"}
                </span>
              </div>
            </div>

            {/* Quick log */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: "+5", sub: locale === "ru" ? "отжим" : "push" },
                { label: "+10", sub: locale === "ru" ? "отжим" : "push" },
                { label: "+20", sub: locale === "ru" ? "отжим" : "push" },
              ].map((q, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-line bg-white/[0.03] hover:bg-white/[0.06] py-3 flex flex-col items-center"
                >
                  <span className="font-display font-bold">{q.label}</span>
                  <span className="text-[10px] text-ink-muted">{q.sub}</span>
                </motion.button>
              ))}
            </div>

            {/* Heatmap mini */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink-muted uppercase tracking-widest">
                  {locale === "ru" ? "12 недель" : "12 weeks"}
                </span>
                <span className="text-xs text-ink-dim number-tabular">
                  {locale === "ru" ? "+42% к прошлой" : "+42% vs last"}
                </span>
              </div>
              <MiniHeatmap />
            </div>

            {/* Mini leaderboard */}
            <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-3">
              <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
                <span className="uppercase tracking-widest">
                  {locale === "ru" ? "Рядом с тобой" : "Near you"}
                </span>
                <Trophy className="size-3.5 text-lime" />
              </div>
              {[
                { rank: 141, name: "Nikita", energy: 312, you: false },
                { rank: 142, name: "You", energy: 286, you: true },
                { rank: 143, name: "Lera", energy: 278, you: false },
              ].map((r) => (
                <div
                  key={r.rank}
                  className={`flex items-center justify-between py-1.5 text-sm ${
                    r.you ? "text-ink" : "text-ink-dim"
                  }`}
                >
                  <span className="number-tabular w-8 text-ink-muted">
                    #{r.rank}
                  </span>
                  <span className={r.you ? "font-semibold" : ""}>{r.name}</span>
                  <span className="number-tabular text-ink-dim">
                    {r.energy} <span className="text-[10px]">{t.scoring.energyShort}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniHeatmap() {
  const cells = Array.from({ length: 12 * 7 });
  return (
    <div className="grid grid-cols-12 gap-1">
      {cells.map((_, i) => {
        const r = Math.sin(i * 0.7) * 0.5 + 0.5;
        let bg = "bg-white/[0.04]";
        if (r > 0.85) bg = "bg-lime";
        else if (r > 0.65) bg = "bg-lime/70";
        else if (r > 0.45) bg = "bg-lime/45";
        else if (r > 0.25) bg = "bg-lime/20";
        return (
          <div
            key={i}
            className={`aspect-square rounded-[3px] ${bg} border border-line/40`}
          />
        );
      })}
    </div>
  );
}

function FloatingChip({
  className,
  tone,
  icon,
  text,
  delay = 0,
}: {
  className?: string;
  tone: "lime" | "violet" | "rose";
  icon: React.ReactNode;
  text: string;
  delay?: number;
}) {
  const toneCls = {
    lime: "border-lime/40 bg-lime/12 text-lime",
    violet: "border-violet/40 bg-violet/15 text-violet-soft",
    rose: "border-accent-rose/40 bg-accent-rose/15 text-accent-rose",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5 },
        y: { delay: delay + 0.4, duration: 5, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-xl shadow-soft ${toneCls[tone]} ${className ?? ""}`}
    >
      {icon}
      {text}
    </motion.div>
  );
}
