"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Snowflake, Zap, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/provider";

interface Props {
  streak: number;
  todayEnergy: number;
  freezes: number;
  /** Called after the user successfully consumes a freeze. */
  onFreezeUsed?: (remaining: number) => void;
  /** Called after the user picks "log now" so the dashboard can
   *  scroll the Quick-log card into view. */
  onLogNow?: () => void;
}

const STORAGE_KEY = "fitstreak.save.shownAt";

/**
 * One-time-per-day "save your streak" modal. Triggers only when:
 *
 *  - the user has a streak of 3+ days,
 *  - they haven't logged activity today,
 *  - it's 21:00 or later in their local time,
 *  - they have at least one freeze in stock,
 *  - we haven't already shown the modal today.
 *
 * The user is offered two actions: log now (close + scroll), or
 * spend one freeze. Either path keeps the streak alive.
 */
export function StreakSaveModal({
  streak,
  todayEnergy,
  freezes,
  onFreezeUsed,
  onLogNow,
}: Props) {
  const { locale } = useI18n();
  const toast = useToast();
  const ru = locale === "ru";
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [localFreezes, setLocalFreezes] = React.useState(freezes);

  React.useEffect(() => setLocalFreezes(freezes), [freezes]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    function check() {
      const hour = new Date().getHours();
      const eligible =
        streak >= 3 && todayEnergy === 0 && freezes > 0 && hour >= 21;
      if (!eligible) return;

      // Once-per-day guard.
      const todayKey = new Date().toISOString().slice(0, 10);
      const last = window.localStorage.getItem(STORAGE_KEY);
      if (last === todayKey) return;

      setOpen(true);
      window.localStorage.setItem(STORAGE_KEY, todayKey);
    }
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [streak, todayEnergy, freezes]);

  function close() {
    setOpen(false);
  }

  async function spendFreeze() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/streak/freeze", { method: "POST" });
      if (!res.ok) throw new Error("freeze_failed");
      const j = (await res.json()) as {
        consumed?: boolean;
        already?: boolean;
        streakFreezes?: number;
      };
      const remaining = j.streakFreezes ?? localFreezes - 1;
      setLocalFreezes(remaining);
      onFreezeUsed?.(remaining);
      toast(
        ru
          ? "Заморозка использована — серия в безопасности"
          : "Freeze used — streak is safe",
        { tone: "success" },
      );
      close();
    } catch {
      toast(
        ru ? "Не получилось — попробуй позже" : "Something went wrong",
        { tone: "error" },
      );
    } finally {
      setBusy(false);
    }
  }

  function logNow() {
    onLogNow?.();
    close();
    if (typeof window !== "undefined") {
      const el = document.querySelector('[data-quick-log]');
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-labelledby="save-streak-title"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="surface border-accent-orange/30 max-w-md w-full p-5 sm:p-6 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start gap-3">
              <div className="size-12 rounded-2xl border border-accent-orange/30 bg-accent-orange/15 text-accent-orange grid place-items-center shrink-0">
                <Flame className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-widest text-accent-orange/80 mb-1">
                  {ru ? "Серия в опасности" : "Streak at risk"}
                </div>
                <h2
                  id="save-streak-title"
                  className="font-display text-lg sm:text-xl font-semibold leading-tight"
                >
                  {ru
                    ? `Сохраним твои ${streak} ${pluralizeRuDays(streak)}?`
                    : `Save your ${streak}-day streak?`}
                </h2>
                <p className="text-sm text-ink-dim mt-2 leading-relaxed">
                  {ru
                    ? "Сегодня ты ещё не двигался. Запиши активность — или потрать одну заморозку, чтобы серия дожила до завтра."
                    : "You haven't moved today. Log a quick activity — or spend one freeze to keep the streak alive until tomorrow."}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={ru ? "Закрыть" : "Close"}
                className="size-8 grid place-items-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/[0.05] shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={logNow}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime/15 border border-lime/40 text-lime hover:bg-lime/25 px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Zap className="size-4" />
                {ru ? "Записать активность" : "Log an activity now"}
              </button>
              <button
                type="button"
                onClick={spendFreeze}
                disabled={busy || localFreezes <= 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Snowflake className="size-4" />
                )}
                {ru
                  ? `Использовать заморозку · ${localFreezes} в запасе`
                  : `Use a freeze · ${localFreezes} left`}
              </button>
            </div>

            <p className="text-[11px] text-ink-muted mt-3 text-center">
              {ru
                ? "Заморозка спасает один пропущенный день. Завтра серия продолжит расти."
                : "A freeze covers one missed day. Tomorrow your streak keeps growing."}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function pluralizeRuDays(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
}
