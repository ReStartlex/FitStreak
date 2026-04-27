"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bell, Heart, Zap, Flame, Loader2, Check } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useI18n } from "@/lib/i18n/provider";
import { SMART_REMINDERS } from "@/lib/mock/reminders";
import { cn } from "@/lib/cn";

interface InitialConfig {
  enabled: boolean;
  morningTime: string;
  eveningTime: string;
  weekendsOff: boolean;
  smartMode: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function RemindersClient({ initial }: { initial: InitialConfig }) {
  const { t, locale } = useI18n();
  const [cfg, setCfg] = React.useState<InitialConfig>(initial);
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function update<K extends keyof InitialConfig>(key: K, value: InitialConfig[K]) {
    setCfg((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function onSave() {
    if (
      !TIME_PATTERN.test(cfg.morningTime) ||
      !TIME_PATTERN.test(cfg.eveningTime)
    ) {
      setError(locale === "ru" ? "Неверный формат времени" : "Invalid time format");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) throw new Error("save_failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch {
      setError(locale === "ru" ? "Не удалось сохранить" : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-display-md sm:text-display-lg font-bold">
            {t.reminders.title}
          </h1>
          <p className="text-ink-dim mt-2 max-w-2xl">{t.reminders.subtitle}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface p-5 sm:p-6 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="size-4 text-lime" />
              <h2 className="font-display text-base font-semibold">
                {t.reminders.timeTitle}
              </h2>
            </div>
            <p className="text-sm text-ink-dim mb-4">{t.reminders.timeSubtitle}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <TimeField
                label={locale === "ru" ? "Утро" : "Morning"}
                value={cfg.morningTime}
                onChange={(v) => update("morningTime", v)}
                presets={["07:00", "08:00", "09:30"]}
              />
              <TimeField
                label={locale === "ru" ? "Вечер" : "Evening"}
                value={cfg.eveningTime}
                onChange={(v) => update("eveningTime", v)}
                presets={["18:00", "19:30", "21:00"]}
              />
            </div>

            <div className="border-t border-line/60 pt-5">
              <div className="flex flex-col gap-3">
                <Switch
                  checked={cfg.enabled}
                  onChange={(v) => update("enabled", v)}
                  label={locale === "ru" ? "Включить напоминания" : "Enable reminders"}
                />
                <Switch
                  checked={cfg.weekendsOff}
                  onChange={(v) => update("weekendsOff", v)}
                  label={locale === "ru" ? "Не беспокоить в выходные" : "Skip on weekends"}
                />
                <Switch
                  checked={cfg.smartMode}
                  onChange={(v) => update("smartMode", v)}
                  label={locale === "ru" ? "Умный режим (контекстные подсказки)" : "Smart mode (contextual nudges)"}
                />
              </div>
            </div>

            <div className="border-t border-line/60 pt-5 mt-5">
              <h3 className="font-display text-base font-semibold mb-3">
                {locale === "ru" ? "Каналы" : "Channels"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <ModeCard
                  icon={<Zap className="size-4 text-lime" />}
                  active={cfg.pushEnabled}
                  title={locale === "ru" ? "Push" : "Push"}
                  desc={locale === "ru" ? "Мобильные уведомления" : "Mobile notifications"}
                  onClick={() => update("pushEnabled", !cfg.pushEnabled)}
                />
                <ModeCard
                  icon={<Heart className="size-4 text-accent-cyan" />}
                  active={cfg.emailEnabled}
                  title={locale === "ru" ? "Email" : "Email"}
                  desc={locale === "ru" ? "Дайджест и важные события" : "Digest & key events"}
                  onClick={() => update("emailEnabled", !cfg.emailEnabled)}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button size="md" onClick={onSave} disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {locale === "ru" ? "Сохраняем…" : "Saving…"}
                  </>
                ) : (
                  t.reminders.save
                )}
              </Button>
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-sm text-lime">
                  <Check className="size-4" />
                  {locale === "ru" ? "Сохранено" : "Saved"}
                </span>
              )}
              {error && <span className="text-sm text-rose">{error}</span>}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="surface p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell className="size-4 text-violet-soft" />
              <h2 className="font-display text-base font-semibold">
                {t.reminders.smartTitle}
              </h2>
            </div>
            <p className="text-xs text-ink-dim mb-4">{t.reminders.smartSubtitle}</p>

            <div className="flex flex-col gap-3">
              {SMART_REMINDERS.map((r, i) => {
                const tone = {
                  lime: "border-lime/30 bg-lime/8",
                  violet: "border-violet/30 bg-violet/8",
                  rose: "border-accent-rose/30 bg-accent-rose/8",
                  cyan: "border-accent-cyan/30 bg-accent-cyan/8",
                }[r.tone];
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className={cn("rounded-xl border p-3 flex items-start gap-3", tone)}
                  >
                    <span className="text-xl mt-0.5">{r.emoji}</span>
                    <div className="text-sm leading-relaxed">
                      {locale === "ru" ? r.textRu : r.textEn}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-line/60 p-3 bg-white/[0.02]">
              <div className="text-xs text-ink-muted">
                <Flame className="inline size-3.5 text-accent-rose mr-1" />
                {locale === "ru"
                  ? "Push в браузере и в мобильном приложении мы пришлём после публичного запуска. Сейчас ты настраиваешь preference — это уже сохраняется в базу."
                  : "Push to your browser and mobile app will arrive after public launch. For now, your preferences are saved to the database."}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function TimeField({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets: string[];
}) {
  return (
    <div>
      <div className="text-xs text-ink-muted uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            type="button"
            className={cn(
              "px-3 h-9 rounded-xl text-sm border transition-colors",
              value === p
                ? "bg-lime-gradient text-bg border-transparent shadow-glow"
                : "border-line bg-white/[0.04] text-ink-dim hover:text-ink",
            )}
          >
            {p}
          </button>
        ))}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/[0.04] border border-line rounded-xl px-3 h-9 text-sm text-ink"
        />
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  active,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "rounded-2xl border p-4 text-left transition-colors",
        active
          ? "border-lime/40 bg-lime/8"
          : "border-line bg-white/[0.02] hover:border-line-strong",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-display font-semibold text-sm">{title}</span>
      </div>
      <p className="text-xs text-ink-dim">{desc}</p>
    </button>
  );
}
