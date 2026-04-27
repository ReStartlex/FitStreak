# Deployment Guide

FitStreak готов к деплою. Рекомендуемый стек:

- **Хостинг**: [Vercel](https://vercel.com)
- **База**: [Neon Postgres](https://neon.tech) (serverless Postgres)
- **Email**: [Resend](https://resend.com) (для писем waitlist)
- **OAuth (опционально)**: Google · Yandex · VK ID

Если что-то из перечисленного не нужно — просто оставь соответствующие
переменные окружения пустыми. UI динамически адаптируется.

---

## 1. Prerequisites

Тебе понадобятся:

- Аккаунт **Vercel** (https://vercel.com)
- Аккаунт **Neon** (https://neon.tech) — Free tier хватит на старт
- Repo на GitHub/GitLab/Bitbucket с этим кодом
- Опционально: аккаунты Google Cloud / Yandex OAuth / VK ID / Resend

---

## 2. База данных (Neon)

1. Создай проект в Neon: `Console → New Project`. Регион — ближе к будущему
   Vercel-региону (например `eu-central-1`).
2. После создания скопируй `DATABASE_URL` со строки `Connection Details →
   Pooled connection` (с `?sslmode=require`).
3. Опционально включи **Read Replicas** для рейтингов в проде.

> Можно использовать любой другой Postgres (Supabase, Railway, RDS) — main
> требование: SSL и поддержка `?sslmode=require`.

### Примените схему

Локально или в CI:

```bash
DATABASE_URL="postgres://..." npx prisma migrate deploy
```

Если ещё нет миграций (первый запуск):

```bash
DATABASE_URL="postgres://..." npm run db:push
```

Засей челленджи и достижения:

```bash
DATABASE_URL="postgres://..." npm run db:seed
```

---

## 3. Auth.js secret

Сгенерируй секрет (используется для подписи JWT):

```bash
openssl rand -base64 32
# или
npx auth secret
```

Сохрани — он понадобится как `AUTH_SECRET` (и заодно как `NEXTAUTH_SECRET`).

---

## 4. OAuth-провайдеры (опционально)

### Google

1. https://console.cloud.google.com → новый проект → `OAuth consent screen`
   (External, добавь `email`, `profile`, `openid`).
2. `Credentials → Create OAuth 2.0 client ID → Web application`.
3. **Authorized redirect URI**:
   `https://YOUR_DOMAIN/api/auth/callback/google`
   (для локальной разработки добавь `http://localhost:3000/api/auth/callback/google`).
4. Скопируй `Client ID` и `Client Secret` — это `AUTH_GOOGLE_ID` /
   `AUTH_GOOGLE_SECRET`.

### Yandex

1. https://oauth.yandex.ru → создай приложение типа "Веб-сервисы".
2. **Callback URI**: `https://YOUR_DOMAIN/api/auth/callback/yandex`.
3. Включи права: email, login.
4. Скопируй ID и пароль приложения — `AUTH_YANDEX_ID` / `AUTH_YANDEX_SECRET`.

### VK ID

1. https://id.vk.com/business/go → новое приложение.
2. **Trusted redirect**: `https://YOUR_DOMAIN/api/auth/callback/vk`.
3. Возьми ID приложения и сервисный ключ — `AUTH_VK_ID` / `AUTH_VK_SECRET`.

> Любого провайдера можно отключить через `ENABLE_OAUTH_GOOGLE=false` и т.п.

---

## 5. Resend (email для waitlist)

1. https://resend.com → API Keys → создай ключ.
2. Подтверди отправляющий домен (`fitstreak.app` или твой собственный).
3. Сохрани ключ как `RESEND_API_KEY` и адрес как `RESEND_FROM`
   (`FitStreak <noreply@fitstreak.app>`).

Без `RESEND_API_KEY` POST `/api/waitlist` будет работать, но письмо не
отправится — заявки всё равно сохранятся в базе.

---

## 6. Деплой на Vercel

1. **Import project** → выбери репозиторий.
2. **Framework**: Next.js (определится автоматически).
3. **Build command**: оставь дефолт `next build` — у нас в `package.json` уже
   `"build": "prisma generate && next build"`.
4. **Install command**: `npm install` (postinstall сам запустит
   `prisma generate`).
5. **Environment Variables** — добавь все переменные из секции 7.
6. После первого деплоя проверь:
   - `https://YOUR_DOMAIN/api/health` возвращает `{ ok: true, env: ... }`
   - `https://YOUR_DOMAIN/sitemap.xml` отдаёт sitemap
   - `https://YOUR_DOMAIN/robots.txt` отдаёт robots.

> ⚠️ **Регион функций.** Поставь Vercel-регион рядом с Neon: `Settings →
> Functions → Region`. Например `Frankfurt (fra1)` если Neon в `eu-central-1`.

---

## 7. Переменные окружения (для Vercel / `.env.local`)

| Переменная             | Обязательно?     | Описание                                    |
| ---------------------- | ---------------- | ------------------------------------------- |
| `DATABASE_URL`         | ✅               | Postgres connection string (с SSL)          |
| `AUTH_SECRET`          | ✅               | Auth.js JWT secret                          |
| `NEXTAUTH_SECRET`      | ✅ (= AUTH_SECRET)| Совместимость со старыми флагами Auth.js    |
| `NEXTAUTH_URL`         | ✅ в проде        | `https://YOUR_DOMAIN`                       |
| `NEXT_PUBLIC_APP_URL`  | ✅                | Тот же `https://YOUR_DOMAIN`                |
| `AUTH_GOOGLE_ID`       | опционально      | Google OAuth client id                      |
| `AUTH_GOOGLE_SECRET`   | опционально      | Google OAuth client secret                  |
| `AUTH_YANDEX_ID`       | опционально      | Yandex OAuth app id                         |
| `AUTH_YANDEX_SECRET`   | опционально      | Yandex OAuth secret                         |
| `AUTH_VK_ID`           | опционально      | VK ID app id                                |
| `AUTH_VK_SECRET`       | опционально      | VK ID secret                                |
| `RESEND_API_KEY`       | опционально      | Resend API key                              |
| `RESEND_FROM`          | опционально      | `"FitStreak <noreply@fitstreak.app>"`       |
| `ENABLE_OAUTH_GOOGLE`  | опционально      | `false`, чтобы скрыть Google                |
| `ENABLE_OAUTH_YANDEX`  | опционально      | `false`, чтобы скрыть Yandex                |
| `ENABLE_OAUTH_VK`      | опционально      | `false`, чтобы скрыть VK                    |

---

## 8. После деплоя

### Smoke-test

- `/` — лендинг открывается, hero-блок виден
- `/signup` — форма регистрации, можно создать аккаунт по email
- `/onboarding` — после регистрации редирект на 3 шага (gender/age → height/
  weight → fitness/goal)
- `/dashboard` — после онбординга, должен показывать today/streak/heatmap
- Quick log → `+10 reps` появляется и счётчик растёт (POST `/api/activity` ok)
- `/leaderboard` — фильтры энерджи / уровень / XP, фильтр scope работает
- `/reminders` — сохранение возвращает success
- `/pricing` → нажать "Перейти на Pro" → открывается Waitlist-диалог

### Мониторинг

- `GET /api/health` — health-check (БД + ENV)
- `Vercel Logs` для серверных эндпоинтов
- `Neon Console` для метрик БД и slow queries

---

## 9. Дальнейшие шаги

- Подключи **Vercel Analytics** или **Plausible** для трафика
- Подключи **Sentry** или Vercel-builtin error monitoring
- Настрой **миграции через GitHub Actions** (`prisma migrate deploy` на main)
- Подключи **CDN-кэш** для статической части лендинга (`Cache-Control` на
  `/_next/image`)
- Включи **HSTS preload** после полугода работы домена со SSL
- Добавь **Redis-rate-limit** (например `@upstash/ratelimit`) для замены
  in-memory лимитера на бесшовный шаринг между instance'ами Vercel

---

## 10. Резервная копия

Neon делает point-in-time recovery автоматически (Free — 7 дней). Для
дополнительной защиты можно настроить ежедневный `pg_dump` в S3 / R2 через
GitHub Actions cron.

---

Готово. После выполнения шагов 1–7 проект работает в продакшене и принимает
реальных пользователей.
