"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Snowflake, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { CURRENT_USER } from "@/lib/mock/user";
import { Button } from "@/components/ui/Button";

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function StreakCard({
  current,
  best,
  freezes,
  onFreezeUsed,
}: {
  current?: number;
  best?: number;
  freezes?: number;
  onFreezeUsed?: (remaining: number) => void;
} = {}) {
  const { t, locale } = useI18n();
  const days = current ?? CURRENT_USER.streak;
  const bestStreak = best ?? CURRENT_USER.bestStreak;
  const dotsToShow = Math.min(days, 28);

  const [pending, setPending] = React.useState(false);
  const [usedToday, setUsedToday] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const freezeCount = freezes ?? 0;
  const canFreeze = freezeCount > 0 && !usedToday && !pending;

  const useFreeze = async () => {
    if (!canFreeze) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/streak/freeze", { method: "POST" });
      if (!res.ok) {
        setError(t.auth.saveError);
        return;
      }
      const data = (await res.json()) as {
        consumed: boolean;
        already?: boolean;
        streakFreezes: number;
      };
      setUsedToday(true);
      onFreezeUsed?.(data.streakFreezes);
    } catch {
      setError(t.auth.saveError);
    } finally {
      setPending(false);
    }
  };

  const word = pluralize(
    freezeCount,
    t.streak.freezeWord1,
    t.streak.freezeWord2,
    t.streak.freezeWord5,
  );

  return (
    <div className="surface p-6 relative overflow-hidden">
      <div className="absolute -right-12 -top-12 size-72 rounded-full bg-accent-orange/15 blur-3xl" />
      <div className="absolute -left-12 -bottom-12 size-72 rounded-full bg-accent-rose/12 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink-dim">
            <Flame className="size-4 text-accent-orange animate-flame" />
            <span className="text-xs uppercase tracking-widest text-ink-muted">
              {t.dashboard.streakTitle}
            </span>
          </div>
          <span className="text-xs text-ink-muted">PR: {bestStreak}</span>
        </div>

        <div>
          <div className="font-display text-display-lg font-bold leading-none">
            <span className="text-gradient-lime">{days}</span>
            <span className="text-ink-dim text-3xl ml-3 font-sans font-normal">
              {locale === "ru" ? "д" : "d"}
            </span>
          </div>
          <div className="text-sm text-ink-dim mt-2">
            {t.streak.visible}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: dotsToShow }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.02 * i, duration: 0.25 }}
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

        <div
          className="rounded-2xl border p-3 flex items-center gap-3"
          style={{
            borderColor: "rgba(125,227,255,0.25)",
            background:
              "linear-gradient(180deg, rgba(125,227,255,0.06), rgba(125,227,255,0.02))",
          }}
        >
          <div
            className="size-9 rounded-xl grid place-items-center shrink-0"
            style={{
              background: "rgba(125,227,255,0.12)",
              border: "1px solid rgba(125,227,255,0.4)",
            }}
          >
            <Snowflake className="size-4" style={{ color: "#7de3ff" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium leading-tight">
              {t.streak.freezeTitle}
            </div>
            <div className="text-xs text-ink-dim leading-tight mt-0.5">
              {freezeCount > 0
                ? t.streak.freezeDesc
                    .replace("{n}", String(freezeCount))
                    .replace("{word}", word)
                : t.streak.freezeNoLeft}
            </div>
          </div>
          {canFreeze && (
            <button
              onClick={useFreeze}
              disabled={pending}
              className="text-[11px] px-2.5 h-8 rounded-xl border border-line bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {pending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Snowflake className="size-3" />
              )}
              <span>{locale === "ru" ? "Заморозить" : "Freeze"}</span>
            </button>
          )}
          {usedToday && (
            <span className="text-[11px] px-2 h-7 rounded-lg bg-lime/15 text-lime inline-flex items-center">
              {locale === "ru" ? "сегодня" : "today"}
            </span>
          )}
        </div>
        {error && <div className="text-xs text-rose">{error}</div>}

        <Button size="sm" variant="primary" className="self-start">
          {t.dashboard.keepStreak}
        </Button>
      </div>
    </div>
  );
}
