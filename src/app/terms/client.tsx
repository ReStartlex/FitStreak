"use client";
/* eslint-disable react/no-unescaped-entities */

import { LegalShell } from "@/components/layout/LegalShell";
import { useI18n } from "@/lib/i18n/provider";

const UPDATED = "2026-04-28";

export default function TermsClient() {
  const { locale } = useI18n();
  return locale === "ru" ? <Ru /> : <En />;
}

function Ru() {
  return (
    <LegalShell
      eyebrow="Правовое"
      title="Условия использования"
      intro="Используя FitStreak, ты соглашаешься с этими условиями. Они написаны человеческим языком, но имеют юридическую силу."
      updated={`Обновлено: ${UPDATED}`}
    >
      <h2>1. Аккаунт</h2>
      <p>
        Для пользования продуктом нужен аккаунт. Один человек — один
        аккаунт. Ты отвечаешь за сохранность пароля и за всё, что
        происходит под твоим логином.
      </p>

      <h2>2. Поведение</h2>
      <ul>
        <li>
          Не публикуй чужие фото и не выдавай себя за другого человека.
        </li>
        <li>
          Не используй продукт для домогательств, угроз, спама.
        </li>
        <li>
          Не пытайся искусственно завышать показатели (накрутка через
          API, скрипты, эмуляция). Мы автоматически блокируем такие
          аккаунты.
        </li>
        <li>
          Не пытайся вскрыть, реверс-инжинирить или ломать инфраструктуру.
        </li>
      </ul>

      <h2>3. Здоровье</h2>
      <p>
        FitStreak — мотивационный инструмент, а не медицинский сервис.
        Перед началом любых физических нагрузок проконсультируйся со
        специалистом. Ты сам отвечаешь за свою безопасность во время
        тренировок.
      </p>

      <h2>4. Контент</h2>
      <p>
        Записи об активностях, ник, фото — твои. Ты предоставляешь нам
        неисключительную лицензию на их хранение и отображение в рамках
        работы продукта (например, в рейтингах и ленте друзей).
      </p>

      <h2>5. Платные функции</h2>
      <p>
        Сейчас FitStreak полностью бесплатен. Платные тарифы (Pro и
        Team) появятся позже — они будут предлагаться отдельно с
        прозрачным описанием.
      </p>

      <h2>6. Прекращение</h2>
      <p>
        Ты можешь удалить аккаунт в любой момент в настройках. Мы
        можем заблокировать аккаунт за нарушение этих условий — в
        большинстве случаев предупредим до блока.
      </p>

      <h2>7. Гарантии</h2>
      <p>
        Продукт предоставляется «как есть». Мы стараемся, чтобы он
        работал стабильно, но не даём абсолютных гарантий доступности
        24/7. Не несём ответственности за упущенную выгоду или потерю
        данных, если они произошли по причинам вне нашего контроля.
      </p>

      <h2>8. Изменения</h2>
      <p>
        Если условия изменятся существенно, предупредим за 14 дней
        письмом или баннером в продукте.
      </p>

      <h2>9. Контакты</h2>
      <p>
        Все вопросы — на <strong>support@fitstreak.ru</strong> или через{" "}
        <a href="/contact">форму контактов</a>.
      </p>
    </LegalShell>
  );
}

function En() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms of Service"
      intro="By using FitStreak, you agree to these terms. They're written in plain language but legally binding."
      updated={`Updated: ${UPDATED}`}
    >
      <h2>1. Account</h2>
      <p>
        You need an account to use the product. One person — one
        account. You are responsible for the safety of your password
        and for everything that happens under your login.
      </p>

      <h2>2. Conduct</h2>
      <ul>
        <li>Don't post photos of others or impersonate anyone.</li>
        <li>
          Don't use the product to harass, threaten, or spam.
        </li>
        <li>
          Don't artificially inflate stats (API abuse, scripts,
          emulation). We auto-flag and ban such accounts.
        </li>
        <li>
          Don't try to break, reverse-engineer, or compromise our
          infrastructure.
        </li>
      </ul>

      <h2>3. Health</h2>
      <p>
        FitStreak is a motivational tool, not a medical service.
        Consult a doctor before starting any new physical activity.
        You alone are responsible for your safety during workouts.
      </p>

      <h2>4. Your content</h2>
      <p>
        Activity entries, your name, your photo — they are yours. You
        grant us a non-exclusive licence to store and display them as
        needed for the product to work (e.g. in leaderboards and
        friends' feeds).
      </p>

      <h2>5. Paid features</h2>
      <p>
        FitStreak is currently free. Paid tiers (Pro and Team) will be
        introduced later and offered transparently with full feature
        disclosure.
      </p>

      <h2>6. Termination</h2>
      <p>
        You can delete your account anytime from Settings. We may
        suspend an account for violating these terms — in most cases
        we'll warn first.
      </p>

      <h2>7. Warranty</h2>
      <p>
        The product is provided "as is". We work hard to keep it
        stable, but make no absolute 24/7 uptime guarantees. We are
        not liable for lost profits or data loss caused by events
        outside our control.
      </p>

      <h2>8. Changes</h2>
      <p>
        For material changes we notify users by email or an in-product
        banner at least 14 days before the change takes effect.
      </p>

      <h2>9. Contact</h2>
      <p>
        Any questions — write to <strong>support@fitstreak.ru</strong>{" "}
        or use the <a href="/contact">contact form</a>.
      </p>
    </LegalShell>
  );
}
