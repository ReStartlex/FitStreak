"use client";

import Link from "next/link";
import { Mail, Code, Sparkles, Heart, Globe, Rocket } from "lucide-react";
import { LegalShell } from "@/components/layout/LegalShell";
import { useI18n } from "@/lib/i18n/provider";

export default function CareersPage() {
  const { locale } = useI18n();
  const ru = locale === "ru";
  return (
    <LegalShell
      eyebrow={ru ? "Команда" : "Team"}
      title={ru ? "Работа в FitStreak" : "Careers at FitStreak"}
      intro={
        ru
          ? "Мы маленькая команда, делаем продукт, которым пользуемся сами. Открытых позиций сейчас немного, но мы всегда рады познакомиться."
          : "We're a small team building a product we use ourselves. We don't have many open roles right now, but we always love to meet good people."
      }
    >
      <h2>{ru ? "Что мы ценим" : "What we value"}</h2>
      <ul className="not-prose grid gap-3 sm:grid-cols-2 my-6 list-none pl-0">
        <Card
          icon={Sparkles}
          title={ru ? "Простота" : "Simplicity"}
          body={
            ru
              ? "Каждая фича доказывает свою нужность. Лишний интерфейс — антифича."
              : "Every feature proves it's needed. Extra UI is a bug."
          }
        />
        <Card
          icon={Code}
          title={ru ? "Качество кода" : "Craft"}
          body={
            ru
              ? "TypeScript, Prisma, тесты на критических путях, ревью без культа."
              : "TypeScript, Prisma, tests on critical paths, reviews without dogma."
          }
        />
        <Card
          icon={Heart}
          title={ru ? "Уважение" : "Respect"}
          body={
            ru
              ? "Никакого кранча и ритуальных стендапов. Доверяем результатам, а не часам в кресле."
              : "No crunch, no theatrical standups. We trust outcomes, not chair-time."
          }
        />
        <Card
          icon={Globe}
          title={ru ? "Удалёнка" : "Remote-first"}
          body={
            ru
              ? "Работаем из любой точки мира, синхронимся по 1-2 часа в день."
              : "We work from anywhere with 1–2 hours of daily overlap."
          }
        />
      </ul>

      <h2>{ru ? "Открытые позиции" : "Open roles"}</h2>
      <p>
        {ru
          ? "Прямо сейчас активно собеседуем на:"
          : "Right now we're actively hiring for:"}
      </p>
      <ul>
        <li>
          <strong>{ru ? "Senior Full-stack инженер" : "Senior Full-stack engineer"}</strong>{" "}
          — Next.js / TypeScript / Postgres.{" "}
          {ru ? "Опыт с Prisma, Vercel, edge runtime — плюс." : "Experience with Prisma, Vercel, edge runtime is a plus."}
        </li>
        <li>
          <strong>{ru ? "Mobile разработчик" : "Mobile engineer"}</strong>{" "}
          — React Native / Expo {ru ? "или" : "or"} Swift / Kotlin.{" "}
          {ru ? "Готовим релизы в App Store и Google Play." : "We're shipping App Store and Google Play apps."}
        </li>
        <li>
          <strong>Product designer</strong>{" "}
          — {ru ? "Figma + хороший вкус. Лучший плюс — пользоваться FitStreak самому." : "Figma + great taste. The best plus is using FitStreak yourself."}
        </li>
      </ul>

      <h2>{ru ? "Что предлагаем" : "What we offer"}</h2>
      <ul>
        <li>{ru ? "Конкурентный оклад + опционы." : "Competitive salary + equity."}</li>
        <li>{ru ? "Удалёнку, гибкий график, оплату коворкинга." : "Remote work, flexible hours, coworking stipend."}</li>
        <li>{ru ? "Бюджет на железо и обучение." : "Hardware and learning budget."}</li>
        <li>{ru ? "Pro подписку FitStreak бесплатно навсегда (как только она появится)." : "FitStreak Pro free forever (the moment it launches)."}</li>
      </ul>

      <h2>{ru ? "Не нашёл свою роль?" : "Don't see your role?"}</h2>
      <p>
        {ru
          ? "Напиши нам всё равно. Иногда мы открываем позицию ради конкретного человека."
          : "Write to us anyway. Sometimes we open a role for a specific person."}
      </p>

      <div className="not-prose mt-8">
        <Link
          href="mailto:jobs@fitstreak.ru?subject=FitStreak%20%E2%80%94%20application"
          className="inline-flex items-center gap-2 rounded-xl border border-lime/40 bg-lime/10 text-lime px-4 py-2.5 text-sm font-medium hover:bg-lime/20 transition-colors"
        >
          <Mail className="size-4" />
          jobs@fitstreak.ru
        </Link>
        <Link
          href="/contact"
          className="ml-2 inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] text-ink px-4 py-2.5 text-sm font-medium hover:bg-white/[0.05] transition-colors"
        >
          <Rocket className="size-4" />
          {ru ? "Через форму" : "Use the form"}
        </Link>
      </div>
    </LegalShell>
  );
}

function Card({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <li className="surface p-4 sm:p-5 rounded-2xl border-line my-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="size-9 rounded-xl border border-violet/30 bg-violet/10 text-violet-soft grid place-items-center">
          <Icon className="size-4" />
        </div>
        <h3 className="font-display text-base font-semibold text-ink m-0">
          {title}
        </h3>
      </div>
      <p className="text-sm text-ink-dim m-0">{body}</p>
    </li>
  );
}
