"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Bell,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";

const STORAGE_KEY = "fitstreak.onboardingTour.v1";

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  iconCls: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    iconCls: "text-violet-soft bg-violet/15 border-violet/30",
    titleRu: "Добро пожаловать в FitStreak",
    titleEn: "Welcome to FitStreak",
    descRu:
      "Маленькие действия каждый день складываются в большую привычку. Покажу 4 ключевые механики за минуту.",
    descEn:
      "Small daily actions compound into a habit. Let me walk you through the four key mechanics in a minute.",
  },
  {
    icon: Zap,
    iconCls: "text-lime bg-lime/15 border-lime/40",
    titleRu: "Energy Score",
    titleEn: "Energy Score",
    descRu:
      "Каждое упражнение конвертируется в энергию по справедливой формуле. 10 отжиманий = 10 ⚡, 1 км ходьбы = 6 ⚡. Цель дня подстраивается под твой уровень и параметры.",
    descEn:
      "Every exercise converts to energy by a fair formula. 10 push-ups = 10 ⚡, 1 km of walking = 6 ⚡. Your daily goal scales with your fitness level and stats.",
  },
  {
    icon: Flame,
    iconCls: "text-accent-orange bg-accent-orange/15 border-accent-orange/40",
    titleRu: "Серия дней",
    titleEn: "Daily streak",
    descRu:
      "Главное — не пропустить день. Серия растёт за любую активность. Если что-то случится — есть заморозки (1–3 в месяц), они сохранят серию.",
    descEn:
      "What matters is not skipping a day. Any activity grows your streak. If life happens, you have 1-3 freezes per month to keep it alive.",
  },
  {
    icon: Trophy,
    iconCls: "text-violet-soft bg-violet/15 border-violet/30",
    titleRu: "Рейтинги и сообщество",
    titleEn: "Leaderboards and community",
    descRu:
      "Подписывайся на друзей — увидишь их активность и обгонишь в дружеском рейтинге. Топ-3 по серии дней — публичная Доска Почёта.",
    descEn:
      "Follow friends — see their activity and overtake them in the friends ranking. Top-3 by streak is the public Wall of Fame.",
  },
  {
    icon: Bell,
    iconCls: "text-accent-cyan bg-accent-cyan/15 border-accent-cyan/40",
    titleRu: "Готов к старту",
    titleEn: "Ready to roll",
    descRu:
      "Начни прямо сейчас: один тап в Quick Log закроет день и заведёт серию. Возвращайся завтра — мы напомним.",
    descEn:
      "Start right now: one tap in Quick Log closes the day and starts your streak. We'll remind you tomorrow.",
  },
];

/**
 * One-time guided tour shown on the dashboard for first-time users.
 * Persists completion in localStorage so it never re-appears for the
 * same browser. The user can also dismiss with Esc / × at any time.
 */
export function OnboardingTour() {
  const { locale } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Wait a tick so the dashboard has time to render its hero.
        const t = window.setTimeout(() => setOpen(true), 600);
        return () => window.clearTimeout(t);
      }
    } catch {
      // localStorage might be blocked; fall through and skip tour.
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  function finish() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function next() {
    if (step >= STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  }

  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4 bg-black/65 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={step}
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md rounded-3xl border border-line bg-bg-card p-6 sm:p-7 shadow-glow"
          >
            <button
              type="button"
              onClick={finish}
              className="absolute right-3 top-3 size-8 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-white/[0.06]"
              aria-label="Skip tour"
            >
              <X className="size-4" />
            </button>

            <div
              className={`size-14 grid place-items-center rounded-2xl border mb-4 ${current.iconCls}`}
            >
              <Icon className="size-6" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2 leading-tight">
              {locale === "ru" ? current.titleRu : current.titleEn}
            </h2>
            <p className="text-sm text-ink-dim leading-relaxed">
              {locale === "ru" ? current.descRu : current.descEn}
            </p>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step
                        ? "w-6 bg-lime"
                        : i < step
                          ? "w-1.5 bg-lime/40"
                          : "w-1.5 bg-white/[0.1]"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prev}
                    className="gap-1 !px-2"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                )}
                <Button onClick={next} size="sm" className="gap-1.5">
                  {step === STEPS.length - 1 ? (
                    <>
                      <Check className="size-4" />
                      {locale === "ru" ? "Поехали" : "Let's go"}
                    </>
                  ) : (
                    <>
                      {locale === "ru" ? "Дальше" : "Next"}
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {step === 0 && (
              <button
                type="button"
                onClick={finish}
                className="mt-4 text-xs text-ink-muted hover:text-ink inline-flex items-center"
              >
                {locale === "ru" ? "Пропустить тур" : "Skip the tour"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
