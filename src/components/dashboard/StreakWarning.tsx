"use client";

import * as React from "react";
import { AlertTriangle, Flame, Snowflake } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface Props {
  streak: number;
  todayEnergy: number;
  freezes: number;
}

/**
 * Subtle warning banner that surfaces only when the active streak is
 * actually at risk:
 *
 *  - the user has a streak of 3+ days,
 *  - they haven't logged any activity yet today,
 *  - it's already past 6pm local time.
 *
 * Designed to *gently* nudge — not nag — and to disappear the
 * moment the user logs their first set of the day.
 */
export function StreakWarning({ streak, todayEnergy, freezes }: Props) {
  const { locale } = useI18n();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      const inDanger =
        streak >= 3 && todayEnergy === 0 && hour >= 18 && hour <= 23;
      setShow(inDanger);
    };
    check();
    // re-check periodically in case the user lingers past 6pm
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [streak, todayEnergy]);

  if (!show) return null;

  return (
    <div className="rounded-2xl border border-accent-orange/40 bg-accent-orange/10 px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3 text-sm">
      <div className="grid place-items-center size-8 rounded-xl bg-accent-orange/20 text-accent-orange shrink-0">
        <AlertTriangle className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold flex items-center gap-1.5 flex-wrap">
          <Flame className="size-4 text-accent-orange" />
          {locale === "ru"
            ? `Серия ${streak} дн. под угрозой`
            : `${streak}-day streak at risk`}
        </div>
        <p className="text-ink-dim mt-1 leading-snug">
          {locale === "ru"
            ? "Любая активность сегодня — и серия выживет."
            : "Any activity today keeps the streak alive."}
          {freezes > 0 && (
            <span className="inline-flex items-center gap-1 ml-2 text-accent-cyan">
              <Snowflake className="size-3" />
              {locale === "ru"
                ? `${freezes} ${pluralizeRuFreezes(freezes)} в запасе`
                : `${freezes} freeze${freezes === 1 ? "" : "s"} available`}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function pluralizeRuFreezes(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "заморозка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return "заморозки";
  return "заморозок";
}
