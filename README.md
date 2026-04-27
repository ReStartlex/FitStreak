# FitStreak

> Streak. Show up. Every day.

**FitStreak** — социальная платформа ежедневной физической активности. Простой
трекер для отжиманий, подтягиваний, шагов, планки, бега и других ежедневных
упражнений, с челленджами, рейтингами и серией дней (streak), которая держит
дисциплину.

Это **production-ready веб-приложение** на Next.js 15 + Auth.js v5 + Prisma +
PostgreSQL. Готово к деплою на Vercel + Neon Postgres. Дальше — мобильное
приложение, шаги/HealthKit/Google Fit и автоматическое начисление XP.

---

## Возможности

### Маршруты

- `/` — Landing page (hero, community counter, фичи, челленджи, прогресс,
  social, how-it-works, отзывы, CTA, footer)
- `/dashboard` — личный кабинет (server component): today, quick log (1-клик),
  streak, daily goal, heatmap (12+ недель), история, статистика, achievements,
  mini-leaderboard
- `/challenges` — список челленджей с табами, прогресс пользователя
- `/challenges/[id]` — детальный экран челленджа
- `/profile` — профиль: статистика, бейджи, body metrics, цель
- `/leaderboard` — рейтинги: день / неделя / друзья / глобальный + по уровню /
  XP с фильтрами по полу, возрасту, fitness-уровню
- `/reminders` — настройки напоминаний (push/email, smart-режим, тихое время)
- `/onboarding` — 3-шаговый онбординг новых пользователей
- `/pricing` — Free / Pro / Team тарифы + Pro/Team waitlist через Resend
- `/signin`, `/signup` — реальная авторизация (Credentials + Google + Yandex +
  VK)

### API

- `POST /api/auth/register` — регистрация по email/пароль
- `GET|POST /api/auth/[...nextauth]` — auth.js handlers (signin/signout/callback)
- `POST /api/activity` — лог активности с anti-cheat и пересчётом ES/XP/level/streak
- `GET /api/activity?range=...` — список активностей
- `GET /api/me`, `PATCH /api/me`, `PATCH /api/me/body` — профиль и метрики
- `GET /api/leaderboard` — рейтинги с фильтрами
- `GET /api/challenges`, `GET /api/challenges/:id`, `POST /api/challenges/:id/join`
- `GET|PATCH /api/reminders`
- `POST /api/waitlist` — Pro/Team waitlist (+ email через Resend)
- `GET /api/health` — health-check (DB + ENV)

### Безопасность

- Auth.js v5 с JWT-сессиями, PrismaAdapter
- bcryptjs для credentials-паролей
- Rate-limiting на критичных endpoints (`activity`, `register`, `waitlist`,
  `me`, `me/body`, `reminders`)
- Anti-cheat: server-side валидация количества/частоты активности
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy в `next.config.mjs`
- Middleware-защита приватных маршрутов

### Дизайн-система

- **Цвета**: dark sports-tech (`#0A0A0B`), акцент lime-неон `#C6FF3D` + violet
  `#7C5CFF`
- **Типографика**: `Space Grotesk` (display) + `Inter` (sans, RU+EN)
- **Компоненты**: Button, Card, Badge, Progress, Tabs, Avatar, Switch, Section,
  AnimatedNumber, WaitlistDialog
- **Анимации**: framer-motion + CSS keyframes
- **Многоязычность**: RU/EN через собственный i18n-провайдер

### Стек

- **Next.js 15** (App Router) + **React 19** + **TypeScript** strict
- **Tailwind CSS** + framer-motion + lucide-react
- **Auth.js v5 (next-auth@beta)** + `@auth/prisma-adapter`
- **Prisma ORM** + PostgreSQL (Neon-совместимая)
- **bcryptjs** для credentials-паролей
- **zod** для валидации payload и ENV
- **resend** для транзакционной почты

---

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Заполнить .env.local на основе .env.example
cp .env.example .env.local

# 3. Применить схему БД
npm run db:push

# 4. Заполнить челленджи и достижения
npm run db:seed

# 5. Запустить dev-сервер
npm run dev
```

Открой `http://localhost:3000`. Health-check: `http://localhost:3000/api/health`.

### Production build

```bash
npm run build
npm run start
```

### Полезные команды

| Команда             | Назначение                                           |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Dev-сервер с HMR                                     |
| `npm run build`     | Prisma generate + Next.js build                      |
| `npm run start`     | Production-сервер                                    |
| `npm run lint`      | ESLint                                               |
| `npm run typecheck` | TypeScript строгая проверка                          |
| `npm run db:push`   | Синхронизировать схему с базой (dev / первый деплой) |
| `npm run db:migrate`| Создать и применить миграцию (рекомендуется)         |
| `npm run db:deploy` | Применить миграции в проде                           |
| `npm run db:studio` | Открыть Prisma Studio                                |
| `npm run db:seed`   | Засеять челленджи и достижения                       |

---

## Переменные окружения

Все ключи описаны в `.env.example`. Минимально необходимые для запуска:

```dotenv
DATABASE_URL=postgres://...   # Neon / любой Postgres
AUTH_SECRET=...               # openssl rand -base64 32
NEXTAUTH_URL=https://...      # URL твоего деплоя
NEXT_PUBLIC_APP_URL=https://... # тот же URL
```

Опционально (можно оставить пустыми, OAuth просто не покажется):

- `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`
- `AUTH_YANDEX_ID`/`AUTH_YANDEX_SECRET`
- `AUTH_VK_ID`/`AUTH_VK_SECRET`
- `RESEND_API_KEY` + `RESEND_FROM` — для писем waitlist

Подробная инструкция по деплою — в [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Структура

```
prisma/
├── schema.prisma         # модели User / Activity / Challenge / Reminder / Waitlist / ...
└── seed.ts               # дефолтные челленджи и достижения

src/
├── app/                  # Next.js App Router
│   ├── api/              # backend route handlers
│   ├── (страницы)
│   ├── error.tsx / loading.tsx / not-found.tsx
│   ├── robots.ts / sitemap.ts / manifest.ts
│   ├── icon.tsx / apple-icon.tsx / opengraph-image.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── auth/, brand/, challenges/, dashboard/, landing/, layout/, profile/, ui/, waitlist/
├── lib/
│   ├── api/              # rate-limit, response helpers, session, anti-cheat, activity-service
│   ├── auth/             # Auth.js config + providers
│   ├── i18n/             # RU/EN dictionaries + provider
│   ├── leveling.ts       # XP → level кривая
│   ├── ranks.ts          # 5 tiers / 13 divisions
│   ├── scoring.ts        # Energy Score / XP / kcal
│   ├── format.ts, cn.ts
│   ├── env.ts            # zod-валидация переменных окружения
│   └── db.ts             # PrismaClient singleton
└── middleware.ts         # auth-guard для приватных маршрутов
```

---

## Скоринг и уровни

- **Energy Score (ES)** — нормализованная единица, применяется в рейтингах
- **XP** — gamified-валюта для прокачки уровня
- **kcal** — расчёт по MET с учётом веса и возраста (если заполнены)
- **Levels** 1..100, кривая `xpForLevel(L) = round(30 × L^1.5)`
- **Ranks**: 5 ярусов (Bronze/Silver/Gold/Elite/Legend), 13 дивизионов
- **Anti-cheat**: дневной и одноразовый кэп на каждое упражнение

Подробности — в `src/lib/scoring.ts`, `src/lib/leveling.ts`, `src/lib/ranks.ts`,
`src/lib/api/anti-cheat.ts`.

---

## Что дальше

- **Мобильное приложение** (Expo / React Native): шаги, HealthKit, Google Fit,
  автоматическое начисление XP/ES
- Платежи: Stripe (мир) + YooMoney / СБП (РФ)
- Push-уведомления через Web Push API + service worker
- AI-инсайты по удержанию привычки в Pro
- Команды (B2B) и брендированные челленджи

---

## Лицензия

UNLICENSED. Все права принадлежат автору.
