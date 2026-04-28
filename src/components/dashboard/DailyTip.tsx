"use client";

import * as React from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface Tip {
  ru: string;
  en: string;
}

const TIPS: Tip[] = [
  {
    ru: "Хочешь устойчивую серию — сделай минимум сегодня. Лучше 5 минут, чем ноль.",
    en: "Sustainable streaks come from showing up. 5 minutes beats zero.",
  },
  {
    ru: "Чередуй упражнения. Силовое + кардио = больше Energy за то же время.",
    en: "Mix strength and cardio — same time, more Energy Score.",
  },
  {
    ru: "Лучшее время для тренировки — то, в которое ты реально тренируешься.",
    en: "The best workout time is the one you’ll actually do.",
  },
  {
    ru: "Серия дороже PR. Сначала сохрани её, потом доводи интенсивность.",
    en: "A streak is worth more than a PR. Protect it first.",
  },
  {
    ru: "Записывай активность сразу — память подвирает.",
    en: "Log right after the set — memory lies.",
  },
  {
    ru: "Маленькие сеты по 5–10 повторений в течение дня дают такие же XP, как один большой.",
    en: "Micro-sets of 5–10 reps add up to the same XP as one big one.",
  },
  {
    ru: "Заморозка серии — стратегический инструмент. Бережёшь её — растёт привычка.",
    en: "Streak freezes are strategic. Protect them, build the habit.",
  },
  {
    ru: "После 21 дня серия начинает тащить тебя сама. Дотерпи.",
    en: "After 21 days the streak starts pulling you. Hold on.",
  },
  {
    ru: "Цель дня лучше выполнить рано. Вечером всегда что-то срывается.",
    en: "Hit your daily goal early. Evenings derail everything.",
  },
  {
    ru: "Подтягивания × 1 = присед × 5 по XP. Проверь сам.",
    en: "1 pull-up ≈ 5 squats by XP. Compare yourself.",
  },
];

/**
 * Pulls a tip deterministically based on the local day so a given
 * user sees the same tip throughout the day, then a fresh one tomorrow.
 */
function pickTip(): Tip {
  const today = new Date();
  const dayKey =
    today.getFullYear() * 10_000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return TIPS[dayKey % TIPS.length];
}

export function DailyTip() {
  const { locale } = useI18n();
  const [tip, setTip] = React.useState<Tip | null>(null);

  // Picking the tip on mount avoids SSR/CSR text mismatch warnings since
  // the day-of-month is computed on the client only.
  React.useEffect(() => {
    setTip(pickTip());
  }, []);

  if (!tip) return null;

  return (
    <div className="surface p-4 sm:p-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 size-32 rounded-full bg-violet/15 blur-2xl pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="grid place-items-center size-9 rounded-xl border border-violet/40 bg-violet/15 text-violet-soft shrink-0">
          <Lightbulb className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest text-ink-muted flex items-center gap-1.5">
            <Sparkles className="size-3" />
            {locale === "ru" ? "Совет дня" : "Daily tip"}
          </div>
          <p className="text-sm sm:text-[15px] mt-1.5 text-ink leading-snug">
            {locale === "ru" ? tip.ru : tip.en}
          </p>
        </div>
      </div>
    </div>
  );
}
