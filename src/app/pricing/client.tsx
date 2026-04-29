"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";
import { WaitlistDialog, type WaitlistPlan } from "@/components/waitlist/WaitlistDialog";

type Cycle = "monthly" | "yearly";

export default function PricingClient() {
  const { t, locale } = useI18n();
  const [cycle, setCycle] = React.useState<Cycle>("yearly");
  const [waitlistPlan, setWaitlistPlan] = React.useState<WaitlistPlan | null>(null);

  const plans = [
    {
      id: "free",
      name: t.pricing.planFreeName,
      desc: t.pricing.planFreeDesc,
      price: { monthly: t.pricing.planFreePrice, yearly: t.pricing.planFreePrice },
      icon: <Sparkles className="size-5" />,
      cta: t.pricing.ctaFree,
      tone: "default" as const,
      featured: false,
      features: locale === "ru"
        ? [
            "Учёт активности и быстрый лог",
            "Серия дней + 2 заморозки в месяц",
            "Публичные челленджи и базовые бейджи",
            "Дневная цель и личная статистика",
            "Глобальный рейтинг (топ-100)",
          ]
        : [
            "Activity tracking and quick log",
            "Day streak + 2 freezes per month",
            "Public challenges and basic badges",
            "Daily goal and personal stats",
            "Global leaderboard (top 100)",
          ],
    },
    {
      id: "pro",
      name: t.pricing.planProName,
      desc: t.pricing.planProDesc,
      price: { monthly: t.pricing.planProPriceMonth, yearly: t.pricing.planProPriceYear },
      icon: <Crown className="size-5" />,
      cta: t.pricing.ctaPro,
      tone: "lime" as const,
      featured: true,
      features: locale === "ru"
        ? [
            "Всё из Free",
            "Безлимитные заморозки серии — никогда не теряй прогресс",
            "1-на-1 дуэли и приватные челленджи с друзьями",
            "Эксклюзивные бейджи (Gold/Elite/Legend) с +XP бонусами",
            "Расширенная аналитика: graph недели/месяца, сравнение периодов",
            "Адаптивная дневная цель под твой ритм и тело",
            "Smart reminders во всех режимах + push в момент потери серии",
            "Полный лидерборд + фильтры по возрасту, полу, уровню",
            "Без рекламы и водяного знака на share-карточках",
          ]
        : [
            "Everything in Free",
            "Unlimited streak freezes — never lose progress",
            "1-on-1 duels and private challenges with friends",
            "Exclusive Gold/Elite/Legend badges with bonus XP",
            "Advanced analytics: week/month graphs, period comparison",
            "Adaptive daily goal tuned to your body and rhythm",
            "Smart reminders in every mode + push when streak is at risk",
            "Full leaderboard with age/gender/fitness filters",
            "No ads and no watermark on share cards",
          ],
    },
    {
      id: "team",
      name: t.pricing.planTeamName,
      desc: t.pricing.planTeamDesc,
      price: { monthly: t.pricing.planTeamPriceMonth, yearly: t.pricing.planTeamPriceYear },
      icon: <Users className="size-5" />,
      cta: t.pricing.ctaTeam,
      tone: "violet" as const,
      featured: false,
      features: locale === "ru"
        ? [
            "Всё из Pro для каждого участника",
            "Закрытые команды до 30 человек",
            "Брендированные челленджи и собственные бейджи",
            "Командный лидерборд и общие серии",
            "Приватные чаты + share-каналы",
            "Корпоративный режим: SSO, отчёты (early access)",
          ]
        : [
            "Everything in Pro for every member",
            "Private teams up to 30 people",
            "Branded challenges and custom badges",
            "Team leaderboard and shared streaks",
            "Private chats + share channels",
            "Corporate mode: SSO, reports (early access)",
          ],
    },
  ];

  return (
    <>
      <Header />
      <main className="container py-10 sm:py-14">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-display-md sm:text-display-lg font-bold text-balance"
          >
            {t.pricing.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-ink-dim mt-3 text-balance"
          >
            {t.pricing.subtitle}
          </motion.p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-card/70 p-1 mt-6">
            <button
              onClick={() => setCycle("monthly")}
              className={cn(
                "px-4 h-9 rounded-full text-sm transition-colors",
                cycle === "monthly"
                  ? "bg-white/[0.08] text-ink"
                  : "text-ink-dim hover:text-ink",
              )}
            >
              {t.pricing.monthly}
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={cn(
                "px-4 h-9 rounded-full text-sm transition-colors inline-flex items-center gap-2",
                cycle === "yearly"
                  ? "bg-white/[0.08] text-ink"
                  : "text-ink-dim hover:text-ink",
              )}
            >
              {t.pricing.yearly}
              <span className="px-1.5 py-0.5 rounded-full bg-lime text-bg text-[10px] font-bold">
                {t.pricing.yearlySave}
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((p, i) => {
            const isFree = p.id === "free";
            const price = p.price[cycle];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.45 }}
                className={cn(
                  "relative surface p-6 sm:p-8 flex flex-col gap-5 overflow-hidden",
                  p.featured && "border-lime/40 shadow-glow",
                )}
              >
                {p.featured && (
                  <>
                    <div className="absolute inset-0 bg-radial-lime opacity-30 pointer-events-none" />
                    <div className="absolute top-4 right-4">
                      <Badge variant="solid">{t.common.mostPopular}</Badge>
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className={cn(
                    "size-10 grid place-items-center rounded-xl border",
                    p.tone === "lime"
                      ? "bg-lime/15 border-lime/40 text-lime"
                      : p.tone === "violet"
                        ? "bg-violet/15 border-violet/40 text-violet-soft"
                        : "bg-white/[0.04] border-line text-ink",
                  )}>
                    {p.icon}
                  </div>
                  <h2 className="font-display text-2xl font-bold mt-4">
                    {p.name}
                  </h2>
                  <p className="text-sm text-ink-dim mt-1">{p.desc}</p>
                </div>

                <div className="relative flex items-baseline gap-2">
                  <span className="font-display text-display-md font-bold number-tabular">
                    {!isFree && t.common.currency}
                    {price}
                  </span>
                  {!isFree && (
                    <span className="text-ink-dim text-sm">
                      {cycle === "monthly" ? t.common.perMonth : t.common.perYear}
                    </span>
                  )}
                </div>

                {p.id === "free" ? (
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 select-none active:translate-y-[1px] h-12 rounded-2xl px-6 text-base w-full bg-white/[0.06] text-ink border border-line hover:bg-white/[0.1] hover:border-line-strong"
                  >
                    {p.cta}
                  </Link>
                ) : (
                  <Button
                    variant={p.featured ? "primary" : "secondary"}
                    size="lg"
                    className="w-full"
                    onClick={() =>
                      setWaitlistPlan(p.id === "pro" ? "PRO" : "TEAM")
                    }
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {p.cta}
                      <span className="px-1.5 py-0.5 rounded-full bg-violet/20 text-violet-soft text-[10px] font-bold">
                        {locale === "ru" ? "СКОРО" : "SOON"}
                      </span>
                    </span>
                  </Button>
                )}

                <ul className="flex flex-col gap-3 relative">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-lime mt-0.5 shrink-0" />
                      <span className="text-ink/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 surface p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Card", icon: "💳" },
              { name: "YooMoney", icon: "🟣", soon: true },
              { name: "СБП / SBP", icon: "🇷🇺", soon: true },
              { name: "Apple Pay", icon: "" },
            ].map((m) => (
              <div
                key={m.name}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 h-9 text-xs"
              >
                <span>{m.icon}</span>
                <span>{m.name}</span>
                {m.soon && (
                  <span className="px-1.5 py-0.5 rounded-full bg-violet/20 text-violet-soft text-[10px] font-bold">
                    {locale === "ru" ? "СКОРО" : "SOON"}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted sm:ml-auto">{t.pricing.payments}</p>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="font-display text-display-md font-bold mb-6 text-center">
            {t.pricing.faqTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
            {(locale === "ru"
              ? [
                  ["Можно ли пользоваться бесплатно?", "Да. Free — это полноценный продукт: учёт активности, серия, базовые челленджи. Pro — для тех, кому нужна расширенная аналитика и больше челленджей."],
                  ["Можно ли отменить подписку?", "В любой момент. Доступ к Pro сохранится до конца оплаченного периода."],
                  ["Как работают командные тарифы?", "Создаёшь команду, приглашаешь до 30 человек, запускаешь общие челленджи и видишь общую аналитику."],
                  ["Платежи в России?", "Скоро подключим YooMoney и СБП. На старте — карты мира."],
                ]
              : [
                  ["Can I use it for free?", "Yes. Free is a full product: activity tracking, streak, basic challenges. Pro adds advanced analytics and more challenge types."],
                  ["Can I cancel anytime?", "Anytime. Pro access stays until the end of the paid period."],
                  ["How do team plans work?", "Create a team, invite up to 30 people, run shared challenges and see team analytics."],
                  ["RU payments?", "YooMoney and SBP are coming. Cards work today."],
                ]).map(([q, a], i) => (
              <div key={i} className="surface p-5">
                <div className="font-medium">{q}</div>
                <p className="text-sm text-ink-dim mt-2">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      <WaitlistDialog
        open={waitlistPlan !== null}
        onClose={() => setWaitlistPlan(null)}
        plan={waitlistPlan ?? "PRO"}
        source="pricing"
      />
    </>
  );
}
