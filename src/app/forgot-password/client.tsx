"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { useI18n } from "@/lib/i18n/provider";

type Step = "request" | "confirm";

export function ForgotPasswordClient() {
  const { locale } = useI18n();
  const router = useRouter();
  const search = useSearchParams();

  const [step, setStep] = React.useState<Step>("request");
  const [email, setEmail] = React.useState(search.get("email") ?? "");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const errorMessage = (k: string | null) => {
    if (!k) return null;
    const m: Record<string, { ru: string; en: string }> = {
      CODE_INVALID: {
        ru: "Неверный код. Проверьте письмо.",
        en: "Invalid code. Check the email.",
      },
      CODE_EXPIRED: {
        ru: "Код истёк — запросите новый.",
        en: "Code expired — request a new one.",
      },
      CODE_NOT_FOUND: {
        ru: "Код не найден.",
        en: "Code not found.",
      },
      USER_NOT_FOUND: {
        ru: "Аккаунт не найден.",
        en: "Account not found.",
      },
      INVALID: {
        ru: "Проверьте поля.",
        en: "Check the fields.",
      },
      DEFAULT: {
        ru: "Что-то пошло не так. Попробуйте ещё раз.",
        en: "Something went wrong. Try again.",
      },
    };
    return (m[k] ?? m.DEFAULT)[locale];
  };

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/password-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) {
        setError("DEFAULT");
        setPending(false);
        return;
      }
      // Always go to step 2 — even for non-existent emails, to avoid leaks
      setStep("confirm");
      setInfo(
        locale === "ru"
          ? "Если email привязан к аккаунту, мы отправили код."
          : "If the email is linked to an account, we sent a code.",
      );
    } catch {
      setError("DEFAULT");
    } finally {
      setPending(false);
    }
  };

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/password-confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code, password }),
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
          <div className="size-12 rounded-2xl bg-violet/10 grid place-items-center mb-4 border border-violet/30">
            <Lock className="size-5 text-violet-soft" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {step === "request"
              ? locale === "ru"
                ? "Восстановить пароль"
                : "Forgot password"
              : locale === "ru"
                ? "Новый пароль"
                : "New password"}
          </h1>
          <p className="text-ink-dim mt-1.5 text-sm">
            {step === "request"
              ? locale === "ru"
                ? "Введите email — пришлём 6-значный код для сброса."
                : "Enter your email — we'll send a 6-digit reset code."
              : locale === "ru"
                ? "Введите код из письма и новый пароль."
                : "Enter the code from the email and a new password."}
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm text-rose">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage(error)}</span>
            </div>
          )}
          {info && step === "confirm" && (
            <div className="mt-4 rounded-xl border border-lime/30 bg-lime/5 p-3 text-sm text-lime">
              {info}
            </div>
          )}

          {step === "request" ? (
            <form className="mt-5 flex flex-col gap-3" onSubmit={onRequest}>
              <Field
                label={locale === "ru" ? "Email" : "Email"}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@fitstreak.ru"
                required
                autoComplete="email"
              />
              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full gap-2"
                disabled={pending || !email}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                {locale === "ru" ? "Отправить код" : "Send code"}
              </Button>
            </form>
          ) : (
            <form className="mt-5 flex flex-col gap-3" onSubmit={onConfirm}>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-ink-dim">
                  {locale === "ru" ? "Код из письма" : "Code from email"}
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
              <Field
                label={locale === "ru" ? "Новый пароль" : "New password"}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={8}
              />
              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full gap-2"
                disabled={pending || code.length !== 6 || password.length < 8}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                {locale === "ru" ? "Сменить пароль" : "Reset password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-ink-dim">
            <Link
              href="/signin"
              className="text-lime font-medium hover:underline"
            >
              {locale === "ru" ? "Назад ко входу" : "Back to sign in"}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-dim">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink placeholder:text-ink-muted/60 focus:border-lime/50 outline-none"
      />
    </label>
  );
}
