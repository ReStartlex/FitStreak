import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/seo/jsonld";
import PricingClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Тарифы FitStreak — Free, Pro, Team",
  description:
    "Free навсегда, Pro для безлимитных заморозок и расширенной аналитики, Team для компаний до 30 человек. Без скрытых платежей, отмена в любой момент.",
  path: "/pricing",
  keywords: [
    "fitstreak pricing",
    "тарифы fitstreak",
    "fitstreak pro",
    "fitness app subscription",
    "habit tracker pricing",
    "командная подписка фитнес",
    "корпоративный фитнес",
  ],
});

const FAQ = [
  {
    q: "Можно ли пользоваться FitStreak бесплатно?",
    a: "Да. Free — это полноценный продукт: учёт активности, серия, базовые челленджи. Pro нужен только для расширенной аналитики и безлимитных заморозок серии.",
  },
  {
    q: "Как отменить подписку Pro?",
    a: "В любой момент в настройках. Доступ к Pro сохраняется до конца оплаченного периода, дальше аккаунт автоматически переходит на Free без потери данных.",
  },
  {
    q: "Как работают командные тарифы?",
    a: "Создаёте команду до 30 человек, приглашаете участников по ссылке, запускаете общие челленджи и видите общий лидерборд. Платит один человек — все получают Pro.",
  },
  {
    q: "Какие методы оплаты поддерживаются в России?",
    a: "Скоро подключим YooMoney и СБП. На старте принимаем карты мира.",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        id="ld-pricing-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Тарифы", url: "/pricing" },
        ])}
      />
      <JsonLd id="ld-pricing-faq" data={faqPageSchema(FAQ)} />
      <PricingClient />
    </>
  );
}
