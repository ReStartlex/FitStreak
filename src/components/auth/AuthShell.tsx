"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Mail } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { useI18n } from "@/lib/i18n/provider";

interface AuthShellProps {
  mode: "signin" | "signup";
  enabledProviders: {
    google: boolean;
    yandex: boolean;
    vk: boolean;
  };
}

export function AuthShell({ mode, enabledProviders }: AuthShellProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const isSignup = mode === "signup";
  const callbackUrl = search.get("from") ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const errorMessage = (code: string | null) => {
    if (!code) return null;
    const map: Record<string, { ru: string; en: string }> = {
      EMAIL_TAKEN: {
        ru: "Этот email уже зарегистрирован. Войдите.",
        en: "This email is already registered. Sign in instead.",
      },
      CredentialsSignin: {
        ru: "Неверный email или пароль.",
        en: "Invalid email or password.",
      },
      OAuthAccountNotLinked: {
        ru: "Этот email уже привязан к другому способу входа.",
        en: "This email is linked to a different sign-in method.",
      },
      Configuration: {
        ru: "Этот способ входа сейчас недоступен. Попробуйте другой.",
        en: "This sign-in method is unavailable right now. Try another.",
      },
      VKID_DENIED: {
        ru: "Вход через VK отменён.",
        en: "VK sign-in was cancelled.",
      },
      VKID_STATE: {
        ru: "Сессия VK истекла. Попробуйте ещё раз.",
        en: "VK session expired. Please try again.",
      },
      VKID_DEVICE: {
        ru: "VK не вернул device_id. Попробуйте ещё раз.",
        en: "VK didn't return a device_id. Please try again.",
      },
      VKID_TOKEN: {
        ru: "Не удалось обменять код VK на токен.",
        en: "Couldn't exchange VK code for a token.",
      },
      VKID_USERINFO: {
        ru: "Не удалось получить профиль из VK.",
        en: "Couldn't fetch VK profile.",
      },
      VKID_NO_EMAIL: {
        ru: "Разрешите VK поделиться email или войдите другим способом.",
        en: "Allow VK to share your email, or use another sign-in method.",
      },
      VKID_USER_MISSING: {
        ru: "Аккаунт VK не найден после авторизации. Попробуйте ещё раз.",
        en: "VK account missing after auth. Try again.",
      },
      VALIDATION: {
        ru: "Проверьте поля и попробуйте снова.",
        en: "Check the fields and try again.",
      },
      DEFAULT: {
        ru: "Что-то пошло не так. Попробуйте ещё раз.",
        en: "Something went wrong. Try again.",
      },
    };
    return (map[code] ?? map.DEFAULT)[locale];
  };

  React.useEffect(() => {
    const errParam = search.get("error");
    if (errParam) setError(errParam);
  }, [search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (isSignup) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, name, locale }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          setError(json?.error?.message ?? "DEFAULT");
          setPending(false);
          return;
        }
        // The new flow always requires email verification before sign-in.
        if (json?.data?.requiresVerification ?? json?.requiresVerification) {
          const e =
            json?.data?.email ?? json?.email ?? email.toLowerCase();
          router.push(`/verify-email?email=${encodeURIComponent(e)}`);
          return;
        }
        // Fallback: legacy response shape — try to sign in directly.
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Distinguish "wrong password" from "unverified account" — the
        // Credentials provider returns null in both cases (which surfaces
        // as CredentialsSignin), so we explicitly check the user state.
        try {
          const probe = await fetch("/api/auth/check-email", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const pjson = await probe.json().catch(() => null);
          const data = pjson?.data ?? pjson;
          if (data?.exists && !data?.verified) {
            // Trigger a fresh code and send the user to /verify-email.
            await fetch("/api/auth/verify-request", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email, locale }),
            }).catch(() => null);
            router.push(
              `/verify-email?email=${encodeURIComponent(email.toLowerCase())}`,
            );
            return;
          }
        } catch {
          // Ignore and fall through to the generic error.
        }
        setError(result.error);
        setPending(false);
        return;
      }

      router.push(isSignup ? "/onboarding" : callbackUrl);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("DEFAULT");
      setPending(false);
    }
  };

  const onOAuth = (provider: "google" | "yandex" | "vk") => {
    setPending(true);
    if (provider === "vk") {
      // VK ID OAuth 2.1 is handled by our own /api/auth/vkid/* routes
      // (the bundled `next-auth/providers/vk` only supports legacy VK
      // and breaks for apps registered at id.vk.com).
      const from = encodeURIComponent(callbackUrl);
      window.location.href = `/api/auth/vkid/start?from=${from}`;
      return;
    }
    void signIn(provider, { callbackUrl });
  };

  const oauthCount =
    Number(enabledProviders.google) +
    Number(enabledProviders.yandex) +
    Number(enabledProviders.vk);

  return (
    <div className="min-h-dvh flex">
      <div className="flex-1 flex flex-col">
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
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {isSignup ? t.auth.signupTitle : t.auth.signinTitle}
            </h1>
            <p className="text-ink-dim mt-1.5 text-sm">
              {isSignup ? t.auth.signupSubtitle : t.auth.signinSubtitle}
            </p>

            {oauthCount > 0 && (
              <>
                <div
                  className="mt-6 grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${oauthCount}, minmax(0, 1fr))` }}
                >
                  {enabledProviders.google && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onOAuth("google")}
                      disabled={pending}
                      className="gap-2"
                    >
                      <GoogleIcon /> Google
                    </Button>
                  )}
                  {enabledProviders.yandex && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onOAuth("yandex")}
                      disabled={pending}
                      className="gap-2"
                    >
                      <YandexIcon /> Яндекс
                    </Button>
                  )}
                  {enabledProviders.vk && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onOAuth("vk")}
                      disabled={pending}
                      className="gap-2"
                    >
                      <VKIcon /> VK
                    </Button>
                  )}
                </div>

                <div className="my-5 flex items-center gap-3 text-xs text-ink-muted uppercase tracking-widest">
                  <span className="flex-1 h-px bg-line" />
                  {t.auth.orContinueWith}
                  <span className="flex-1 h-px bg-line" />
                </div>
              </>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm text-rose">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMessage(error)}</span>
              </div>
            )}

            <form className="flex flex-col gap-3" onSubmit={onSubmit}>
              {isSignup && (
                <Field
                  label={t.auth.name}
                  type="text"
                  placeholder="Alex"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                  required
                />
              )}
              <Field
                label={t.auth.email}
                type="email"
                placeholder="you@fitstreak.app"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
              />
              <Field
                label={t.auth.password}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={8}
                required
              />

              {!isSignup && (
                <div className="text-right -mt-1">
                  <Link
                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                    className="text-xs text-ink-dim hover:text-lime"
                  >
                    {locale === "ru" ? "Забыли пароль?" : "Forgot password?"}
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full gap-2"
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                {isSignup ? t.nav.signup : t.nav.signin}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-ink-dim">
              {isSignup ? t.auth.hasAccount : t.auth.noAccount}{" "}
              <Link
                href={isSignup ? "/signin" : "/signup"}
                className="text-lime font-medium hover:underline"
              >
                {isSignup ? t.nav.signin : t.nav.signup}
              </Link>
            </div>
          </motion.div>
        </main>
      </div>

      <aside className="hidden lg:flex flex-1 relative overflow-hidden bg-bg-soft border-l border-line">
        <div className="absolute inset-0 bg-radial-lime opacity-60" />
        <div className="absolute inset-0 bg-radial-violet opacity-50" />
        <div className="absolute inset-0 grid-bg opacity-30 mask-fade-b" />
        <div className="relative flex flex-col justify-center p-12 max-w-xl">
          <span className="chip self-start">
            <span className="size-1.5 rounded-full bg-lime animate-pulse-soft" />
            FitStreak
          </span>
          <h2 className="font-display text-display-lg font-bold mt-5 leading-[1.05]">
            {locale === "ru"
              ? "Двигайся каждый день — и серия будет расти."
              : "Move every day — and your streak will grow."}
          </h2>
          <p className="text-ink-dim mt-4 max-w-md">
            {locale === "ru"
              ? "Простой трекер активности с челленджами и рейтингами. Один тап — и день засчитан, серия не разорвана."
              : "A simple activity tracker with challenges and leaderboards. One tap and the day counts — your streak stays alive."}
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  minLength,
  required,
}: {
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-dim">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink placeholder:text-ink-muted/60 focus:border-lime/50 outline-none"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path
        fill="#EA4335"
        d="M12 5.04c1.62 0 3.07.56 4.22 1.66l3.16-3.16C17.45 1.7 14.97.7 12 .7 7.36.7 3.4 3.36 1.5 7.18l3.69 2.86C6.06 7.32 8.79 5.04 12 5.04z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h6.47c-.28 1.51-1.13 2.78-2.39 3.63l3.65 2.83c2.13-1.97 3.36-4.87 3.36-8.7z"
      />
      <path
        fill="#FBBC05"
        d="M5.19 14.04A7.18 7.18 0 0 1 4.83 12c0-.71.13-1.4.36-2.04L1.5 7.18A11.9 11.9 0 0 0 0 12c0 1.93.46 3.75 1.27 5.36l3.92-3.32z"
      />
      <path
        fill="#34A853"
        d="M12 23.3c3.24 0 5.96-1.07 7.95-2.91l-3.65-2.83c-1.01.68-2.31 1.08-4.3 1.08-3.21 0-5.94-2.28-6.81-5.36L1.27 16.36C3.16 20.55 7.27 23.3 12 23.3z"
      />
    </svg>
  );
}

function YandexIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
      <path
        fill="#fff"
        d="M13.32 18.5h2.18V5.5h-3.17c-3.18 0-4.85 1.63-4.85 4.04 0 1.92.91 3.05 2.55 4.18l-2.85 4.78h2.36l3.17-5.32-1.1-.74c-1.34-.9-1.99-1.6-1.99-3.1 0-1.32.93-2.21 2.71-2.21h.99V18.5z"
      />
    </svg>
  );
}

function VKIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <rect width="24" height="24" rx="6" fill="#0077FF" />
      <path
        fill="#fff"
        d="M19.4 8.05c.13-.42 0-.72-.6-.72h-1.96c-.5 0-.74.27-.86.56 0 0-1.02 2.49-2.46 4.1-.46.46-.67.61-.93.61-.13 0-.31-.15-.31-.57V8.05c0-.5-.14-.72-.55-.72H8.94c-.31 0-.5.23-.5.45 0 .47.7.58.78 1.91v2.88c0 .64-.11.75-.37.75-.7 0-2.36-2.5-3.34-5.36-.2-.55-.39-.78-.89-.78H2.66c-.57 0-.69.27-.69.56 0 .53.7 3.16 3.18 6.64 1.66 2.38 4 3.66 6.13 3.66 1.28 0 1.43-.29 1.43-.78v-1.79c0-.57.12-.68.52-.68.29 0 .79.15 1.95 1.27 1.34 1.34 1.56 1.94 2.31 1.94h1.97c.56 0 .85-.29.69-.85-.18-.57-.85-1.4-1.74-2.39-.48-.57-1.21-1.18-1.43-1.49-.31-.39-.22-.57 0-.92 0 0 2.53-3.55 2.79-4.76z"
      />
    </svg>
  );
}
