"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Mail, Send, CheckCircle2, Loader2, Shield, Bug } from "lucide-react";
import { LegalShell } from "@/components/layout/LegalShell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/provider";

const TOPICS = [
  "general",
  "bug",
  "feature",
  "billing",
  "press",
  "abuse",
] as const;
type Topic = (typeof TOPICS)[number];

export default function ContactClient() {
  const { locale } = useI18n();
  const ru = locale === "ru";
  const toast = useToast();
  const { data: session } = useSession();

  const [topic, setTopic] = React.useState<Topic>("general");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [website, setWebsite] = React.useState(""); // honeypot
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.email && !email) setEmail(session.user.email);
    if (session?.user?.name && !name) setName(session.user.name);
    // We intentionally don't depend on email/name to avoid clobbering
    // the user's edits on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, session?.user?.name]);

  const TOPIC_LABEL: Record<Topic, string> = ru
    ? {
        general: "Общий вопрос",
        bug: "Нашёл баг",
        feature: "Идея / предложение",
        billing: "Платежи и тарифы",
        press: "Пресса / партнёрство",
        abuse: "Жалоба / безопасность",
      }
    : {
        general: "General question",
        bug: "Bug report",
        feature: "Feature idea",
        billing: "Billing & plans",
        press: "Press / partnership",
        abuse: "Abuse / safety",
      };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (message.trim().length < 10) {
      toast(
        ru ? "Сообщение слишком короткое" : "Message is too short",
        { tone: "error" },
      );
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, topic, message, website }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          toast(
            ru ? "Слишком много запросов, попробуй позже" : "Too many requests",
            { tone: "error" },
          );
        } else {
          toast(
            ru ? "Не удалось отправить" : "Couldn't send the message",
            { tone: "error" },
          );
        }
        return;
      }
      setDone(true);
    } catch {
      toast(ru ? "Ошибка сети" : "Network error", { tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <LegalShell
        eyebrow={ru ? "Контакты" : "Contact"}
        title={ru ? "Сообщение отправлено" : "Message sent"}
        intro={
          ru
            ? "Спасибо! Мы прочитаем твоё письмо и ответим в течение 1–2 рабочих дней."
            : "Thanks! We'll read your message and reply within 1–2 business days."
        }
      >
        <div className="not-prose surface p-6 sm:p-8 rounded-2xl border-line my-6 flex items-start gap-4">
          <CheckCircle2 className="size-8 text-lime shrink-0" />
          <div>
            <p className="text-sm text-ink-dim m-0">
              {ru
                ? "Если письмо срочное и про безопасность аккаунта, продублируй на "
                : "If your message is urgent and about account safety, also write to "}
              <a
                href="mailto:support@fitstreak.ru"
                className="text-lime underline-offset-4 hover:underline"
              >
                support@fitstreak.ru
              </a>
              .
            </p>
          </div>
        </div>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      eyebrow={ru ? "Контакты" : "Contact"}
      title={ru ? "Связаться с нами" : "Get in touch"}
      intro={
        ru
          ? "Идеи, баги, партнёрство — мы читаем всё. Обычно отвечаем в течение 1–2 рабочих дней."
          : "Ideas, bugs, partnerships — we read everything. We usually reply within 1–2 business days."
      }
    >
      <div className="not-prose grid gap-3 sm:grid-cols-3 my-6">
        <Channel
          icon={Mail}
          title={ru ? "Поддержка" : "Support"}
          email="support@fitstreak.ru"
        />
        <Channel
          icon={Bug}
          title={ru ? "Безопасность" : "Security"}
          email="security@fitstreak.ru"
        />
        <Channel
          icon={Shield}
          title={ru ? "Приватность" : "Privacy"}
          email="privacy@fitstreak.ru"
        />
      </div>

      <form onSubmit={submit} className="not-prose grid gap-4 my-6">
        <Field
          label={ru ? "Тема" : "Topic"}
          control={
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((id) => {
                const active = topic === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setTopic(id)}
                    className={
                      "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors " +
                      (active
                        ? "border-lime/60 bg-lime/15 text-lime"
                        : "border-line bg-white/[0.02] text-ink-muted hover:text-ink")
                    }
                  >
                    {TOPIC_LABEL[id]}
                  </button>
                );
              })}
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={ru ? "Имя" : "Name"}
            control={
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                className="w-full rounded-lg bg-white/[0.04] border border-line px-3 py-2 text-sm focus:outline-none focus:border-lime/60"
              />
            }
          />
          <Field
            label="Email"
            control={
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
                className="w-full rounded-lg bg-white/[0.04] border border-line px-3 py-2 text-sm focus:outline-none focus:border-lime/60"
              />
            }
          />
        </div>
        <Field
          label={ru ? "Сообщение" : "Message"}
          control={
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              maxLength={4000}
              placeholder={
                ru
                  ? "Опиши свой вопрос. Чем больше деталей — тем быстрее ответим."
                  : "Describe your question. The more detail you give, the faster we can answer."
              }
              className="w-full rounded-lg bg-white/[0.04] border border-line px-3 py-2 text-sm focus:outline-none focus:border-lime/60 resize-y min-h-32"
            />
          }
        />

        {/* Honeypot — hidden from real users, only bots fill it. */}
        <label className="sr-only" aria-hidden="true">
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-ink-muted">
            {ru
              ? "Отправляя, ты соглашаешься с "
              : "By sending, you agree to our "}
            <a href="/privacy" className="text-lime underline-offset-4 hover:underline">
              {ru ? "политикой конфиденциальности" : "privacy policy"}
            </a>
            .
          </p>
          <Button type="submit" disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {ru ? "Отправить" : "Send"}
          </Button>
        </div>
      </form>
    </LegalShell>
  );
}

function Field({
  label,
  control,
}: {
  label: string;
  control: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">
        {label}
      </div>
      {control}
    </label>
  );
}

function Channel({
  icon: Icon,
  title,
  email,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  email: string;
}) {
  return (
    <a
      href={`mailto:${email}`}
      className="surface px-4 py-3 rounded-xl border-line flex items-center gap-3 hover:bg-white/[0.04] transition-colors"
    >
      <div className="size-9 rounded-xl border border-lime/30 bg-lime/10 text-lime grid place-items-center shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-ink-muted">{title}</div>
        <div className="text-sm font-medium truncate">{email}</div>
      </div>
    </a>
  );
}
