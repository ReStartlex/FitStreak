"use client";

import * as React from "react";
import { Download, X, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEY = "fitstreak.pwa.dismissed";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks
const SHOW_AFTER_MS = 5_000;

/**
 * Non-intrusive install banner that surfaces once Chrome / Edge fire
 * the `beforeinstallprompt` event. We delay it a few seconds after
 * page load so it doesn't fight first-paint, and remember dismissal
 * for two weeks so we don't pester the user.
 *
 * iOS Safari doesn't fire this event — there we show a small "Add to
 * Home Screen" hint with the share-then-add instructions instead.
 */
export function InstallPrompt() {
  const { locale } = useI18n();
  const [evt, setEvt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [installing, setInstalling] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed (standalone display mode).
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari sets a non-standard `standalone` flag on navigator
      // when the page was launched from a Home Screen icon.
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) return;

    // Recent dismissal — back off.
    const dismissed = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");
    if (dismissed && Date.now() - dismissed < DISMISS_TTL_MS) return;

    function onBeforeInstall(ev: Event) {
      ev.preventDefault();
      setEvt(ev as BeforeInstallPromptEvent);
      const t = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
      window.addEventListener(
        "beforeunload",
        () => window.clearTimeout(t),
        { once: true },
      );
    }

    function onInstalled() {
      setVisible(false);
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS fallback hint.
    const ua = window.navigator.userAgent;
    const isIos =
      /iPhone|iPad|iPod/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
    if (isIos) {
      const t = window.setTimeout(() => setShowIos(true), SHOW_AFTER_MS);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
        window.clearTimeout(t);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    setShowIos(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
  }

  async function install() {
    if (!evt) return;
    setInstalling(true);
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      if (choice.outcome !== "accepted") {
        // User declined — same as a manual dismiss.
        dismiss();
      }
      setVisible(false);
    } finally {
      setInstalling(false);
    }
  }

  // Either the Chrome banner or the iOS hint — never both.
  if (visible && evt) {
    return (
      <Banner
        onDismiss={dismiss}
        title={
          locale === "ru"
            ? "Установи FitStreak"
            : "Install FitStreak"
        }
        body={
          locale === "ru"
            ? "Открывай в один тап с домашнего экрана. Без браузера, оффлайн-кэш, мгновенный запуск."
            : "Launch from your home screen. No browser bar, offline cache, instant start."
        }
        cta={locale === "ru" ? "Установить" : "Install"}
        onCta={install}
        loading={installing}
      />
    );
  }

  if (showIos) {
    return (
      <Banner
        onDismiss={dismiss}
        title={
          locale === "ru"
            ? "Добавь на главный экран"
            : "Add to Home Screen"
        }
        body={
          locale === "ru"
            ? 'В Safari нажми «Поделиться» (квадрат со стрелкой) → «На экран Домой».'
            : 'In Safari, tap the Share icon (square with arrow) → "Add to Home Screen".'
        }
      />
    );
  }

  return null;
}

function Banner({
  title,
  body,
  cta,
  onCta,
  onDismiss,
  loading,
}: {
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
  onDismiss: () => void;
  loading?: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-label={title}
      className="fixed inset-x-3 bottom-3 z-[60] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
    >
      <div className="surface px-4 py-3 sm:px-5 sm:py-4 border border-lime/30 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="size-9 grid place-items-center rounded-xl border border-lime/40 bg-lime/10 text-lime shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold text-sm">{title}</div>
            <div className="text-xs text-ink-dim mt-1 leading-relaxed">
              {body}
            </div>
            {cta && onCta ? (
              <button
                type="button"
                onClick={onCta}
                disabled={loading}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-lime/50 bg-lime/15 text-lime px-3 py-1.5 text-xs font-medium hover:bg-lime/25 disabled:opacity-50"
              >
                <Download className="size-3.5" />
                {cta}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="size-7 grid place-items-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/[0.05] shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
