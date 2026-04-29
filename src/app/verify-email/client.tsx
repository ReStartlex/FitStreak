"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { useI18n } from "@/lib/i18n/provider";

const RESEND_COOLDOWN_S = 45;

export function VerifyEmailClient() {
  const { locale } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const queryEmail = search.get("email") ?? "";

  const [email, setEmail] = React.useState(queryEmail);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(RESEND_COOLDOWN_S);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const errorMessage = (k: string | null) => {
    if (!k) return null;
    const m: Record<string, { ru: string; en: string }> = {
      CODE_INVALID: {
        ru: "Неверный код. Проверьте письмо ещё раз.",
        en: "Invalid code. Check the email again.",
      },
      CODE_EXPIRED: {
        ru: "Код истёк — запросите новый.",
        en: "Code expired — request a new one.",
      },
      CODE_NOT_FOUND: {
        ru: "Код не найден. Запросите новый.",
        en: "Code not found. Request a new one.",
      },
      USER_NOT_FOUND: {
        ru: "Аккаунт не найден. Зарегистрируйтесь заново.",
        en: "Account not found. Please sign up again.",
      },
      DEFAULT: {
        ru: "Что-то пошло не так. Попробуйте ещё раз.",
        en: "Something went wrong. Try again.",
      },
    };
    return (m[k] ?? m.DEFAULT)[locale];
  };

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/verify-confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error?.message ?? "DEFAULT");
        setPending(false);
        return;
      }
      router.push(json?.onboarded ? "/dashboard" : "/onboarding");
      router.refresh();
    } catch {
      setError("DEFAULT");
      setPending(false);
    }
  };

  const onResend = async () => {
    if (cooldown > 0 || !email) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await fetch("/api/auth/verify-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error?.message ?? "DEFAULT");
      } else if (json?.alreadyVerified) {
        router.push("/signin");
      } else {
        setInfo(
          locale === "ru"
            ? "Новый код отправлен на ваш email."
            : "A new code has been sent to your email.",
        );
        setCooldown(RESEND_COOLDOWN_S);
      }
    } catch {
      setError("DEFAULT");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="container py-5 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <LocaleSwitch />
      </header>
      <main className="flex-1 grid place-items-center px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md surface p-6 sm:p-8"
        >
          <div className="size-12 rounded-2xl bg-lime/10 grid place-items-center mb-4 border border-lime/30">
            <Mail className="size-5 text-lime" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {locale === "ru" ? "Подтвердите email" : "Confirm your email"}
          </h1>
          <p className="text-ink-dim mt-1.5 text-sm">
            {locale === "ru"
              ? "Мы отправили 6-значный код на"
              : "We sent a 6-digit code to"}{" "}
            <span className="text-ink">{email || "—"}</span>.{" "}
            {locale === "ru" ? "Введите его ниже." : "Enter it below."}
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm text-rose">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage(error)}</span>
            </div>
          )}
          {info && (
            <div className="mt-4 rounded-xl border border-lime/30 bg-lime/5 p-3 text-sm text-lime">
              {info}
            </div>
          )}

          <form className="mt-5 flex flex-col gap-3" onSubmit={onConfirm}>
            {!queryEmail && (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-ink-dim">
                  {locale === "ru" ? "Email" : "Email"}
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink placeholder:text-ink-muted/60 focus:border-lime/50 outline-none"
                  placeholder="you@fitstreak.ru"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-ink-dim">
                {locale === "ru" ? "Код подтверждения" : "Verification code"}
              </span>
              <input
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                autoFocus
                autoComplete="one-time-code"
                placeholder="123456"
                className="h-14 rounded-xl border border-line bg-white/[0.03] px-3.5 text-center font-mono text-2xl tracking-[0.5em] text-ink placeholder:text-ink-muted/60 focus:border-lime/50 outline-none"
              />
            </label>

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full gap-2"
              disabled={pending || code.length !== 6}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {locale === "ru" ? "Подтвердить" : "Confirm"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-ink-dim">
            <button
              onClick={onResend}
              disabled={cooldown > 0 || resending || !email}
              className="text-lime font-medium hover:underline disabled:text-ink-muted disabled:no-underline disabled:cursor-not-allowed"
            >
              {resending
                ? locale === "ru"
                  ? "Отправляем…"
                  : "Sending…"
                : cooldown > 0
                  ? locale === "ru"
                    ? `Запросить новый код (${cooldown}с)`
                    : `Resend code (${cooldown}s)`
                  : locale === "ru"
                    ? "Запросить новый код"
                    : "Resend code"}
            </button>
            <Link
              href="/signin"
              className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
            >
              {locale === "ru" ? "Вернуться ко входу" : "Back to sign in"}
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">
            {locale === "ru"
              ? "Письмо может прийти в спам. Срок действия кода — 10 минут."
              : "Email may land in spam. Codes are valid for 10 minutes."}
          </p>
        </motion.div>
      </main>
    </div>
  );
}
