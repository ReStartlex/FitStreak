import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { CommunityCounter } from "@/components/landing/CommunityCounter";
import { Features } from "@/components/landing/Features";
import { ChallengesShowcase } from "@/components/landing/ChallengesShowcase";
import { ProgressShowcase } from "@/components/landing/ProgressShowcase";
import { SocialShowcase } from "@/components/landing/SocialShowcase";
import { TopStreaks } from "@/components/landing/TopStreaks";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, faqPageSchema } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — Серия. Каждый день. Без оправданий.`,
  description: siteConfig.description.ru,
  path: "/",
});

const HOMEPAGE_FAQ = [
  {
    q: "Что такое FitStreak?",
    a: "FitStreak — это социальная платформа ежедневной активности. Серия дней, очки энергии, уровни и челленджи делают регулярные тренировки таким же простым ритуалом, как утренний кофе.",
  },
  {
    q: "Сколько стоит FitStreak?",
    a: "Free навсегда: учёт активности, серия, базовые челленджи и глобальный лидерборд. Pro расширяет аналитику и снимает лимит на заморозки серии.",
  },
  {
    q: "Что такое серия (streak) в FitStreak?",
    a: "Серия — это число дней подряд, в которые ты записал хотя бы одну активность. Серию можно сохранить заморозкой при пропуске дня.",
  },
  {
    q: "На каких устройствах работает FitStreak?",
    a: "FitStreak — это PWA: открывается в любом современном браузере и устанавливается как приложение на iOS, Android и десктоп. Нативные приложения в магазинах — следующий шаг.",
  },
  {
    q: "Как FitStreak защищает данные?",
    a: "Мы храним только данные, нужные продукту, не передаём их в рекламные сети, поддерживаем HTTPS и шифруем секреты. Подробности в нашей политике конфиденциальности.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd id="ld-home-faq" data={faqPageSchema(HOMEPAGE_FAQ)} />
      <Header />
      <main>
        <Hero />
        <CommunityCounter />
        <TopStreaks />
        <Features />
        <ChallengesShowcase />
        <ProgressShowcase />
        <SocialShowcase />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
