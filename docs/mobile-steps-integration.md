# Mobile step tracking integration

## Цель

В мобильном приложении пользователь не должен вручную вводить пройденные
километры — телефон считает шаги фоном, а сервер конвертирует их в Energy
Score и XP при достижении пороговых значений (1, 2, 3, 5, 10 км и т.д.).

## Backend (готов)

API уже готов принимать данные с телефона. У `ActivityRecord` есть поле
`source` со значениями:

- `MANUAL` — ручной ввод (web)
- `MOBILE` — generic мобильное приложение
- `HEALTHKIT` — Apple Health (iOS)
- `GOOGLE_FIT` — Google Fit (Android)
- `IMPORT` — импорт CSV / партнёрские интеграции

При логировании из мобилки нужно отправлять source и amount как
обычный `POST /api/activity`:

```http
POST /api/activity
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "exerciseId": "running",   // walking | running
  "amount": 1,                // km
  "source": "HEALTHKIT"       // optional in current schema
}
```

> Сейчас `POST /api/activity` принимает только `exerciseId + amount`. Перед
> запуском мобилки расширь zod-схему, чтобы принимать `source` и
> при необходимости `recordedAt` (для офлайн-синка).

## Mobile-specific логика (требует разработки)

### iOS

1. Получить разрешение `HKQuantityTypeIdentifierStepCount` и
   `HKQuantityTypeIdentifierDistanceWalkingRunning` через `HealthKit`.
2. Зарегистрировать `HKObserverQuery` для пушей при изменении.
3. Раз в N минут (или при возврате в фокус) запрашивать
   суммарную дистанцию с `lastSyncTimestamp` и слать на сервер,
   разбивая по 1-км баккетам:
   - 0 → 1.0 км → POST `{exerciseId: "walking", amount: 1, source: "HEALTHKIT"}`
   - 1.0 → 2.0 км → следующий POST и т.д.
4. Сохранять локально last-synced timestamp.

### Android

Аналогично через `Health Connect` (новый API) или `Google Fit Recording API`
(legacy). Periodic worker раз в 15 мин синкает недавние данные.

### Anti-cheat

- Отправлять только дистанцию из официального step counter API. Не доверять
  ручным значениям клиента.
- Серверный `validateAmount()` уже ограничивает разумным дневным капом.
- Минимальная дистанция для одного record-а = 0.5 км, чтобы избегать спам-инкрементов.

### Energy Score конверсия

Существующая логика в `src/lib/scoring.ts`:

- `running`: `BASE_PER_UNIT = 60`, `XP_PER_UNIT = 30` (за 1 км)
- `walking`: `BASE_PER_UNIT = 25`, `XP_PER_UNIT = 12` (за 1 км)

Калории считаются по MET-формуле с учётом веса/возраста/роста (`calcKcal`
в `src/lib/scoring.ts`). Всё уже учитывается автоматически когда мобилка
шлёт `POST /api/activity`.

## TODO для запуска

- [ ] React Native / Flutter / Native модуль, считывающий шаги
- [ ] Background sync (BGAppRefreshTask на iOS, WorkManager на Android)
- [ ] Расширение API: добавить `source` и `recordedAt` в zod схему `/api/activity`
- [ ] UI на мобиле: live-карточка "1 км до следующих +60 ES"
- [ ] Push-уведомления через Resend/OneSignal перед потерей серии
