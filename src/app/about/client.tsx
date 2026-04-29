"use client";

import { Flame, Trophy, Users, Heart, Activity, Sparkles } from "lucide-react";
import { LegalShell } from "@/components/layout/LegalShell";
import { useI18n } from "@/lib/i18n/provider";

export default function AboutClient() {
  const { locale } = useI18n();
  const ru = locale === "ru";

  return (
    <LegalShell
      eyebrow={ru ? "О проекте" : "About"}
      title={ru ? "Делаем спорт повседневной привычкой" : "Making movement a daily habit"}
      intro={
        ru
          ? "FitStreak — социальная платформа ежедневной активности. Мы объединили серии, рейтинги и быстрый учёт в один продукт, чтобы тренироваться было также легко, как чистить зубы."
          : "FitStreak is a social platform for daily activity. We combine streaks, leaderboards, and one-tap logging in a single product so working out is as easy as brushing your teeth."
      }
    >
      <h2>{ru ? "Зачем FitStreak" : "Why FitStreak"}</h2>
      <p>
        {ru
          ? "Большинство трекеров заточены под профессиональных спортсменов: сложные графики, метрики VO₂max, планы на 12 недель. Мы строим обратное — простую систему, которая держит обычного человека в форме маленькими ежедневными шагами."
          : "Most trackers are built for athletes — complex charts, VO₂ max metrics, 12-week training blocks. We are building the opposite: a simple system that keeps regular people in shape through small daily steps."}
      </p>
      <p>
        {ru
          ? "FitStreak — это серия (streak), очки энергии (Energy Score) и уровни. Лог трёх отжиманий в обед — уже плюс к серии. Прогулка пятнадцать минут — тоже. Главное — не остановиться."
          : "FitStreak is a streak, an Energy Score and levels. Log three push-ups at lunch — your streak grows. Walk fifteen minutes — same thing. The point is to not stop."}
      </p>

      <h2>{ru ? "Как считаются очки" : "How scoring works"}</h2>
      <FeatureGrid
        items={[
          {
            icon: Activity,
            title: ru ? "Energy Score" : "Energy Score",
            body: ru
              ? "Универсальная единица для любых упражнений. Отжимания, бег, планка, приседания — всё конвертируется в одну метрику и складывается за день."
              : "A universal unit for every exercise. Push-ups, running, planks, squats — everything converts into a single metric that accumulates through the day.",
          },
          {
            icon: Sparkles,
            title: "XP",
            body: ru
              ? "Опыт за активности и достижения. Накопил XP — поднялся в уровне. Всего 100 уровней и 5 рангов."
              : "Experience earned for activities and achievements. Stack up XP and you level up. 100 levels, 5 ranks.",
          },
          {
            icon: Flame,
            title: ru ? "Серия дней" : "Streak",
            body: ru
              ? "Главный мотиватор. День без активности — серия обнуляется. Чтобы не терять прогресс на форс-мажорах, есть «заморозки»."
              : "Your main driver. Skip a day and the streak resets. To survive emergencies, there are freezes.",
          },
          {
            icon: Trophy,
            title: ru ? "Челленджи" : "Challenges",
            body: ru
              ? "Личные и групповые цели на 7, 14, 30 дней. Челлендж — это контракт с собой: дойти, не пропустить, сравнить с другими."
              : "Personal and group goals over 7, 14, 30 days. A challenge is a contract with yourself: finish, don't miss, compare to others.",
          },
        ]}
      />

      <h2>{ru ? "Антифрод" : "Anti-cheat"}</h2>
      <p>
        {ru
          ? "У каждого упражнения есть лимит «за раз» и дневной потолок. Мы не верим в «1000 отжиманий за один подход» — здравый смысл и физиология подсказывают, что это или вредно, или враньё. Алгоритм мягкий: просим разделить запись на части или отвергаем явно невозможные значения."
          : "Each exercise has per-set and per-day caps. We don't believe in '1000 push-ups in one set' — common sense and physiology say it's either harmful or fake. The algorithm is gentle: we ask the user to split big entries or reject obviously impossible numbers."}
      </p>
      <p>
        {ru
          ? "Серии и заморозки тоже защищены: нельзя «дописать» вчера сегодня. Окно правки записи — 24 часа, дальше история фиксируется."
          : "Streaks and freezes are protected too: you can't 'backfill yesterday today.' The edit window for any record is 24 hours; after that, history is locked in."}
      </p>

      <h2>{ru ? "Социальная часть" : "Social layer"}</h2>
      <FeatureGrid
        items={[
          {
            icon: Users,
            title: ru ? "Друзья и подписки" : "Friends & follows",
            body: ru
              ? "Подписывайся на тех, кто мотивирует. Видишь их активности в ленте, реагируешь, обгоняешь."
              : "Follow people who push you forward. See their activities in your feed, react to them, overtake them.",
          },
          {
            icon: Trophy,
            title: ru ? "Рейтинги" : "Leaderboards",
            body: ru
              ? "Глобальные и среди друзей. Энергия за день, уровень, серия — три способа сравнить себя с другими."
              : "Global and friends-only. Daily energy, level, streak — three ways to compare yourself with others.",
          },
          {
            icon: Heart,
            title: ru ? "Реакции" : "Reactions",
            body: ru
              ? "Без комментариев и токсичности. Шесть эмодзи на активность — быстрая поддержка без долгих переписок."
              : "No comments, no toxicity. Six emoji per activity — quick encouragement without endless threads.",
          },
        ]}
      />

      <h2>{ru ? "Что дальше" : "What's next"}</h2>
      <p>
        {ru
          ? "Мы планируем мобильные приложения для iOS и Android, интеграции с Apple Health, Google Fit, Mi Fitness, групповые челленджи для команд и тренеров, и кастомные напоминания на основе твоего распорядка."
          : "We're shipping mobile apps for iOS and Android, integrations with Apple Health, Google Fit, Mi Fitness, team and coach challenges, and smart reminders based on your routine."}
      </p>
      <p>
        {ru
          ? "Если ты бизнес или фитнес-сообщество и хочешь попасть в пилот — напиши нам через "
          : "If you're a business or a fitness community and want to be part of the pilot, reach us via "}
        <a href="/contact">{ru ? "форму контактов" : "contact form"}</a>.
      </p>
    </LegalShell>
  );
}

function FeatureGrid({
  items,
}: {
  items: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
  }[];
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 not-prose my-6 list-none pl-0">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <li
            key={it.title}
            className="surface p-4 sm:p-5 rounded-2xl border-line my-0"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="size-9 rounded-xl border border-lime/30 bg-lime/10 text-lime grid place-items-center">
                <Icon className="size-4" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink m-0">
                {it.title}
              </h3>
            </div>
            <p className="text-sm text-ink-dim m-0">{it.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
