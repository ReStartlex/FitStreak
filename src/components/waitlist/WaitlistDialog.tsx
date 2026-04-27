"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

export type WaitlistPlan = "PRO" | "TEAM";

interface Props {
  open: boolean;
  onClose: () => void;
  plan: WaitlistPlan;
  source?: string;
}

export function WaitlistDialog({ open, onClose, plan, source }: Props) {
  const { t, locale } = useI18n();
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSuccess(false);
      setError(null);
      setPending(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan, source, locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? "save_failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message === "save_failed"
            ? t.waitlist?.error ??
              (locale === "ru" ? "Не удалось отправить" : "Failed to submit")
            : err.message
          : t.waitlist?.error ??
            (locale === "ru" ? "Не удалось отправить" : "Failed to submit"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-bg/70 backdrop-blur-md p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "surface w-full max-w-md p-6 sm:p-7 relative overflow-hidden",
              "border-lime/30",
            )}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 size-8 grid place-items-center rounded-full hover:bg-white/[0.06] text-ink-muted"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="absolute -top-20 -right-20 size-60 rounded-full bg-lime/15 blur-3xl pointer-events-none" />

            <div className="relative">
              {success ? (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="size-12 grid place-items-center rounded-full bg-lime/15 border border-lime/40 mb-3">
                    <Check className="size-6 text-lime" />
                  </div>
                  <h3 className="font-display text-xl font-bold">
                    {t.waitlist?.successTitle ??
                      (locale === "ru" ? "Вы в листе ожидания" : "You're on the waitlist")}
                  </h3>
                  <p className="text-sm text-ink-dim mt-2 max-w-sm">
                    {t.waitlist?.successDesc ??
                      (locale === "ru"
                        ? "Мы напишем вам, как только запустим этот тариф."
                        : "We'll email you the moment the plan goes live.")}
                  </p>
                  <Button onClick={onClose} className="mt-5" variant="secondary">
                    {locale === "ru" ? "Хорошо" : "Got it"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-widest text-lime mb-1.5">
                    {plan === "PRO" ? "Pro" : "Team"} ·{" "}
                    {locale === "ru" ? "ранний доступ" : "early access"}
                  </div>
                  <h3 className="font-display text-2xl font-bold">
                    {t.waitlist?.title ??
                      (locale === "ru"
                        ? "Записаться в waitlist"
                        : "Join the waitlist")}
                  </h3>
                  <p className="text-sm text-ink-dim mt-2">
                    {t.waitlist?.subtitle ??
                      (locale === "ru"
                        ? "Платный тариф готовится к запуску. Оставь email — пришлём приглашение в первый же день."
                        : "Paid plan is launching soon. Leave your email and we'll send the invite on day one.")}
                  </p>

                  <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        t.waitlist?.placeholder ??
                        (locale === "ru" ? "you@example.com" : "you@example.com")
                      }
                      className="w-full bg-white/[0.04] border border-line focus:border-lime/60 rounded-xl px-4 h-11 text-sm text-ink outline-none transition-colors"
                    />
                    {error && (
                      <div className="text-sm text-rose">{error}</div>
                    )}
                    <Button type="submit" size="lg" disabled={pending}>
                      {pending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          {locale === "ru" ? "Отправляем…" : "Submitting…"}
                        </>
                      ) : (
                        t.waitlist?.cta ??
                        (locale === "ru" ? "Записаться" : "Notify me")
                      )}
                    </Button>
                    <p className="text-[11px] text-ink-muted text-center">
                      {locale === "ru"
                        ? "Никакого спама. Только запуск и важные апдейты."
                        : "No spam. Only launch and key updates."}
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
