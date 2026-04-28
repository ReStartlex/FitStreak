"use client";
/* eslint-disable react/no-unescaped-entities */

import { LegalShell } from "@/components/layout/LegalShell";
import { useI18n } from "@/lib/i18n/provider";

const UPDATED = "2026-04-28";

export default function PrivacyPage() {
  const { locale } = useI18n();
  return locale === "ru" ? <Ru /> : <En />;
}

function Ru() {
  return (
    <LegalShell
      eyebrow="Правовое"
      title="Политика конфиденциальности"
      intro="Кратко: мы собираем минимум данных, нужных для работы продукта, не продаём их и не передаём рекламным сетям. Полные подробности — ниже."
      updated={`Обновлено: ${UPDATED}`}
    >
      <h2>1. Кто мы</h2>
      <p>
        FitStreak — продукт, доступный по адресу{" "}
        <a href="https://fitstreak.ru">fitstreak.ru</a>. Контактный email
        для запросов по приватности — <strong>privacy@fitstreak.ru</strong>.
      </p>

      <h2>2. Какие данные мы собираем</h2>
      <ul>
        <li>
          <strong>Аккаунт.</strong> Email, имя, никнейм, фото профиля.
          При входе через Google/Yandex/VK ID получаем те же поля от
          провайдера.
        </li>
        <li>
          <strong>Активность.</strong> Записи об упражнениях, время и
          объём. Используются для расчёта серии, очков и уровней.
        </li>
        <li>
          <strong>Опциональные физические параметры.</strong> Возраст,
          пол, рост, вес — нужны для точного расчёта калорий. Можно не
          указывать.
        </li>
        <li>
          <strong>Технические данные.</strong> Cookies сессии, IP-адрес
          (для антифрода и rate-limit), user-agent.
        </li>
      </ul>

      <h2>3. Зачем мы их обрабатываем</h2>
      <ul>
        <li>Логика продукта: серия, лидерборд, уведомления.</li>
        <li>Безопасность: вход, защита от ботов, антифрод.</li>
        <li>
          Транзакционные письма (Resend): подтверждение почты,
          восстановление пароля, дайджесты, предупреждения о серии.
        </li>
        <li>Аналитика продукта в агрегированном виде.</li>
      </ul>

      <h2>4. С кем мы делимся</h2>
      <p>FitStreak использует следующих субподрядчиков:</p>
      <ul>
        <li>
          <strong>Vercel</strong> — хостинг и доставка.
        </li>
        <li>
          <strong>Neon</strong> — управляемая Postgres-база.
        </li>
        <li>
          <strong>Resend</strong> — отправка email.
        </li>
        <li>
          <strong>Google, Yandex, VK ID</strong> — провайдеры входа,
          если ты выбрал такой способ.
        </li>
      </ul>
      <p>
        Мы не продаём данные третьим лицам и не передаём их рекламным
        сетям.
      </p>

      <h2>5. Хранение и безопасность</h2>
      <p>
        Пароли хранятся в виде криптографических хэшей (bcrypt). Между
        тобой и сервером всегда HTTPS. Данные в БД лежат в Neon с
        точечным шифрованием на уровне платформы.
      </p>

      <h2>6. Твои права</h2>
      <ul>
        <li>
          <strong>Скачать.</strong> На странице{" "}
          <a href="/settings">«Настройки»</a> есть экспорт всех твоих
          данных в JSON.
        </li>
        <li>
          <strong>Изменить.</strong> Любое поле профиля и физические
          метрики редактируются в настройках.
        </li>
        <li>
          <strong>Удалить.</strong> Кнопка «Удалить аккаунт» необратимо
          стирает учётку и все связанные данные в течение 24 часов.
        </li>
        <li>
          <strong>Возразить.</strong> Можно отписаться от любых писем
          ссылкой в подвале или через настройки.
        </li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        Используем минимум: один cookie сессии next-auth, опционально —
        локальные ключи в браузере для языка и закрытых баннеров. Без
        рекламных или трекинг-cookies.
      </p>

      <h2>8. Дети</h2>
      <p>
        FitStreak не предназначен для лиц моложе 13 лет. Если ты узнал
        о таком аккаунте — сообщи нам, мы его удалим.
      </p>

      <h2>9. Изменения политики</h2>
      <p>
        Если политика изменится существенно, мы предупредим письмом
        или баннером в продукте за 14 дней.
      </p>

      <h2>10. Связаться</h2>
      <p>
        Любые вопросы — на <strong>privacy@fitstreak.ru</strong> или
        через <a href="/contact">форму контактов</a>.
      </p>
    </LegalShell>
  );
}

function En() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy policy"
      intro="In short: we collect the minimum data the product needs, never sell it, and never share it with ad networks. Full details below."
      updated={`Updated: ${UPDATED}`}
    >
      <h2>1. Who we are</h2>
      <p>
        FitStreak is the product available at{" "}
        <a href="https://fitstreak.ru">fitstreak.ru</a>. Privacy contact:{" "}
        <strong>privacy@fitstreak.ru</strong>.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Account.</strong> Email, name, username, profile photo.
          When signing in with Google / Yandex / VK ID, we receive the
          same fields from the provider.
        </li>
        <li>
          <strong>Activity.</strong> Exercise entries, timestamps,
          volumes. Used to compute streaks, scores, levels.
        </li>
        <li>
          <strong>Optional body metrics.</strong> Age, gender, height,
          weight — used for accurate calorie estimation. Optional.
        </li>
        <li>
          <strong>Technical data.</strong> Session cookies, IP address
          (anti-fraud and rate-limit), user-agent.
        </li>
      </ul>

      <h2>3. Why we process it</h2>
      <ul>
        <li>Product logic: streaks, leaderboards, notifications.</li>
        <li>Security: sign-in, bot protection, anti-cheat.</li>
        <li>
          Transactional email (Resend): email verification, password
          reset, digests, streak warnings.
        </li>
        <li>Aggregate product analytics.</li>
      </ul>

      <h2>4. Who we share with</h2>
      <p>FitStreak uses the following subprocessors:</p>
      <ul>
        <li>
          <strong>Vercel</strong> — hosting and delivery.
        </li>
        <li>
          <strong>Neon</strong> — managed Postgres.
        </li>
        <li>
          <strong>Resend</strong> — email delivery.
        </li>
        <li>
          <strong>Google, Yandex, VK ID</strong> — sign-in providers, if
          you chose that flow.
        </li>
      </ul>
      <p>We don't sell data and don't share it with ad networks.</p>

      <h2>5. Storage and security</h2>
      <p>
        Passwords are stored as cryptographic hashes (bcrypt). All
        traffic between you and the server is HTTPS. Data in the
        database is encrypted at rest by the platform.
      </p>

      <h2>6. Your rights</h2>
      <ul>
        <li>
          <strong>Export.</strong> On the <a href="/settings">Settings</a>{" "}
          page you'll find a JSON export of everything we have on you.
        </li>
        <li>
          <strong>Edit.</strong> Every profile field and body metric is
          editable in settings.
        </li>
        <li>
          <strong>Delete.</strong> The "Delete account" button
          irreversibly wipes your account and all related data within
          24 hours.
        </li>
        <li>
          <strong>Object.</strong> You can unsubscribe from any email
          via the footer link or via settings.
        </li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        Minimal usage: a single next-auth session cookie and a few
        browser-local keys for language and dismissed banners. No ad
        or tracking cookies.
      </p>

      <h2>8. Children</h2>
      <p>
        FitStreak isn't intended for users under 13. If you spot such
        an account, let us know — we'll remove it.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        For material changes we notify users by email or an in-product
        banner at least 14 days before the change takes effect.
      </p>

      <h2>10. Contact</h2>
      <p>
        Any questions — write to <strong>privacy@fitstreak.ru</strong>{" "}
        or use the <a href="/contact">contact form</a>.
      </p>
    </LegalShell>
  );
}
