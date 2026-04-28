/* eslint-disable react/no-unescaped-entities */
/**
 * Blog post registry. Each post is a small bilingual document with
 * an `intro` paragraph and a `body` rendered as React. Keeping the
 * source in TypeScript lets us inline icons / surface components
 * without an MDX dependency for two-three posts.
 */

import * as React from "react";

export type Locale = "ru" | "en";

export interface BlogPost {
  slug: string;
  date: string; // ISO YYYY-MM-DD
  readingMinutes: number;
  title: { ru: string; en: string };
  excerpt: { ru: string; en: string };
  cover: { tone: "lime" | "violet" | "rose" | "cyan" | "orange"; emoji: string };
  body: { ru: React.ReactNode; en: React.ReactNode };
}

export const POSTS: BlogPost[] = [
  {
    slug: "why-streaks-work",
    date: "2026-04-15",
    readingMinutes: 5,
    cover: { tone: "lime", emoji: "🔥" },
    title: {
      ru: "Почему серии работают (и где они ломают людей)",
      en: "Why streaks work — and where they break people",
    },
    excerpt: {
      ru: "Серия — самый сильный мотиватор в фитнес-приложениях. Но у неё есть тёмная сторона. Разбираем, как мы её обуздали в FitStreak.",
      en: "Streaks are the strongest motivator in fitness apps. But they have a dark side. Here's how we tamed it in FitStreak.",
    },
    body: {
      ru: (
        <>
          <p>
            Серия — это число подряд идущих дней с активностью. Звучит
            просто, работает безотказно: за 100 лет привычка делать
            что-то «каждый день» превращается в идентичность. «Я тот,
            кто бегает», а не «я бегаю».
          </p>

          <h2>Темная сторона</h2>
          <p>
            Проблема в том, что классическая серия превращает спорт в
            налог. Один пропуск — и пользователь уходит, разочарованный
            в себе. Сломали 90 дней? Логин больше не нужен.
          </p>

          <h2>Как мы решаем</h2>
          <ul>
            <li>
              <strong>Заморозки.</strong> Ты получаешь по одной за
              каждый новый уровень. Они тратятся автоматически, если
              пропустил один день. Серия не теряется.
            </li>
            <li>
              <strong>Маленький порог.</strong> Чтобы зачесть день,
              нужны не «100 отжиманий», а 5 минут движения. Прогулка,
              лёгкая зарядка, растяжка — всё считается.
            </li>
            <li>
              <strong>Без шейминга.</strong> Если пропустил без
              заморозки, серия начинается заново. Никаких писем «ты нас
              разочаровал», только дружелюбное «возьми старт сначала».
            </li>
          </ul>

          <h2>Что в итоге</h2>
          <p>
            Серия должна толкать вперёд, а не наказывать. В нашем
            тестовом периоде 64% пользователей, потерявших серию,
            начинали новую в течение трёх дней. Это и есть здоровая
            работа механики.
          </p>
        </>
      ),
      en: (
        <>
          <p>
            A streak is the number of consecutive days you logged
            activity. Sounds simple, works ruthlessly: for the past
            century, doing something "every day" reliably turns a
            habit into an identity. "I'm someone who runs," not "I
            run."
          </p>

          <h2>The dark side</h2>
          <p>
            The catch: a classic streak turns exercise into a tax. One
            miss and the user walks away disappointed in themselves.
            Broke 90 days? The app loses them.
          </p>

          <h2>How we deal with it</h2>
          <ul>
            <li>
              <strong>Freezes.</strong> You earn one per level. Spent
              automatically when you miss a single day. The streak
              survives.
            </li>
            <li>
              <strong>Low bar.</strong> A day counts not at "100
              push-ups" but at five minutes of movement. A walk, light
              exercise, stretching — all valid.
            </li>
            <li>
              <strong>No shaming.</strong> If you miss without a freeze,
              your streak resets. No "you let us down" emails — just a
              friendly "let's start over."
            </li>
          </ul>

          <h2>The result</h2>
          <p>
            A streak should pull you forward, not punish you. In our
            beta, 64% of users who lost a streak started a new one
            within three days. That's the mechanic working as intended.
          </p>
        </>
      ),
    },
  },
  {
    slug: "energy-score-explained",
    date: "2026-04-22",
    readingMinutes: 4,
    cover: { tone: "violet", emoji: "⚡" },
    title: {
      ru: "Energy Score: одна метрика для любых упражнений",
      en: "Energy Score: one metric for every exercise",
    },
    excerpt: {
      ru: "Как мы смешиваем отжимания, бег и планку в одну универсальную единицу — и почему это лучше, чем считать калории.",
      en: "How we blend push-ups, running, and planks into one universal unit — and why that beats counting calories.",
    },
    body: {
      ru: (
        <>
          <p>
            Калории — старый добрый показатель, но проблем у него
            больше, чем достоинств. Он зависит от веса, метаболизма и
            настроения трекера. Главное — он плохо мотивирует. «300
            ккал» абстрактны, а вот «250 Energy Score сегодня» —
            конкретны.
          </p>

          <h2>Как считается</h2>
          <p>
            У каждого упражнения есть собственный коэффициент. Для
            силовых — за повторение, для кардио и планки — за минуту.
            Базу мы калибровали по реальным данным MET (metabolic
            equivalent of task) и подбирали так, чтобы средний день
            давал 100–250 ES.
          </p>

          <ul>
            <li>10 отжиманий ≈ 8 ES</li>
            <li>1 минута бега ≈ 11 ES</li>
            <li>20 приседаний ≈ 14 ES</li>
            <li>1 минута планки ≈ 6 ES</li>
            <li>1 минута прогулки ≈ 3 ES</li>
          </ul>

          <h2>Зачем это</h2>
          <p>
            Universal currency — твой день имеет один итог. Это даёт
            тебе ощущение контроля и сравнимости: «вчера 180, сегодня
            220 — стало лучше». Не нужно держать в голове разные
            метрики для разных видов спорта.
          </p>

          <h2>А калории?</h2>
          <p>
            Они тоже считаются — на основе твоего веса, роста и
            возраста, чтобы можно было видеть оба числа. Но в продукте
            они на втором плане: главное — ES.
          </p>
        </>
      ),
      en: (
        <>
          <p>
            Calories are an old, friendly metric — and they cause more
            problems than they solve. They depend on weight, metabolism,
            and the tracker's mood. Worse, they motivate badly. "300
            kcal" is abstract; "250 Energy Score today" is concrete.
          </p>

          <h2>How it's computed</h2>
          <p>
            Every exercise gets its own coefficient. Strength
            movements scale by reps, cardio and isometric holds by
            minute. We calibrated the base to real MET data (metabolic
            equivalent of task) so an average day lands at 100–250 ES.
          </p>

          <ul>
            <li>10 push-ups ≈ 8 ES</li>
            <li>1 minute of running ≈ 11 ES</li>
            <li>20 squats ≈ 14 ES</li>
            <li>1 minute of plank ≈ 6 ES</li>
            <li>1 minute of walking ≈ 3 ES</li>
          </ul>

          <h2>Why bother</h2>
          <p>
            One universal currency means your day has one number. You
            feel in control and can compare: "yesterday 180, today 220
            — better." No need to mentally translate metrics across
            different sports.
          </p>

          <h2>And calories?</h2>
          <p>
            We compute them too, based on your weight, height and age,
            so you can see both. But in the product, they take the back
            seat — Energy Score is the main lens.
          </p>
        </>
      ),
    },
  },
  {
    slug: "five-minute-rule",
    date: "2026-04-26",
    readingMinutes: 3,
    cover: { tone: "rose", emoji: "⏱" },
    title: {
      ru: "Правило 5 минут: как начать тренироваться, когда лень",
      en: "The 5-minute rule: how to start training when you don't feel like it",
    },
    excerpt: {
      ru: "Простая ментальная техника, которая помогает не сорвать серию в плохой день. Спойлер: главное — не цель, а старт.",
      en: "A simple mental trick that keeps the streak alive on bad days. Spoiler: it's not about the goal, it's about the start.",
    },
    body: {
      ru: (
        <>
          <p>
            Большинство людей, которые сорвали серию, не делают этого
            из-за травмы или болезни. Они просто прокрастинируют. К
            22:00 «уже поздно». К 22:30 «всё, день потерян».
          </p>

          <h2>Правило 5 минут</h2>
          <p>
            Договорись с собой: только 5 минут. Не 30, не 20 — пять.
            Никаких «правильных тренировок». Просто включил и подвигался.
          </p>
          <p>
            В 90% случаев через 2 минуты ты захочешь продолжить. Это
            работает потому, что вход — самый дорогой шаг. Когда ты
            уже встал, потеть ещё 15 минут уже не больно.
          </p>

          <h2>Если не захочешь — окей</h2>
          <p>
            Если через 5 минут ты решишь остановиться, всё равно молодец.
            Серия жива, день засчитан. Завтра будет лучше.
          </p>
        </>
      ),
      en: (
        <>
          <p>
            Most people who break a streak don't break it due to
            injury or illness. They procrastinate. By 10pm "it's too
            late". By 10:30 "the day is lost".
          </p>

          <h2>The 5-minute rule</h2>
          <p>
            Make a deal with yourself: just five minutes. Not 30, not
            20 — five. No "proper workout". Just turn it on and move.
          </p>
          <p>
            In 90% of cases you'll want to continue after two minutes.
            It works because the start is the expensive step. Once
            you're up, sweating for another 15 minutes is no longer
            painful.
          </p>

          <h2>If you don't want to — fine</h2>
          <p>
            If after five minutes you decide to stop, you're still
            golden. Streak alive, day counted. Tomorrow will be better.
          </p>
        </>
      ),
    },
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function listPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}
