"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AtSign,
  Ban,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  Settings as SettingsIcon,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";

interface UserCtx {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  locale: string;
  image: string | null;
  plan: string;
  emailVerified: boolean;
  streakFreezes: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  totalXp: number;
  isPublic: boolean;
  showOnLeaderboard: boolean;
  reminders: {
    enabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smartMode: boolean;
    weekendsOff: boolean;
    morningTime: string;
    eveningTime: string;
  } | null;
}

export function SettingsClient({ user }: { user: UserCtx }) {
  const { locale, setLocale } = useI18n();
  const router = useRouter();

  const [name, setName] = React.useState(user.name ?? "");
  const [username, setUsername] = React.useState(user.username ?? "");
  const [image, setImage] = React.useState(user.image ?? "");
  const [isPublic, setIsPublic] = React.useState(user.isPublic);
  const [showOnLb, setShowOnLb] = React.useState(user.showOnLeaderboard);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const togglePrivacy = async (
    field: "isPublic" | "showOnLeaderboard",
    next: boolean,
  ) => {
    if (field === "isPublic") setIsPublic(next);
    else setShowOnLb(next);
    try {
      await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
    } catch {
      // revert on failure
      if (field === "isPublic") setIsPublic(!next);
      else setShowOnLb(!next);
    }
  };

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          username: username.trim().toLowerCase() || "",
          image: image.trim() || "",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const code = json?.error?.message;
        setError(
          code === "USERNAME_TAKEN"
            ? locale === "ru"
              ? "Этот username уже занят."
              : "That username is taken."
            : locale === "ru"
              ? "Не удалось сохранить."
              : "Couldn't save.",
        );
        setPending(false);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setError(locale === "ru" ? "Ошибка сети." : "Network error.");
    } finally {
      setPending(false);
    }
  };

  const onLocaleChange = async (newLocale: "ru" | "en") => {
    setLocale(newLocale);
    await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    });
  };

  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [deletePending, setDeletePending] = React.useState(false);
  const onDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeletePending(true);
    try {
      const res = await fetch("/api/me/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        setDeletePending(false);
        setDeleteConfirm(false);
      }
    } catch {
      setDeletePending(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <main className="container py-8 sm:py-10 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-2xl bg-violet/12 grid place-items-center border border-violet/30">
            <SettingsIcon className="size-5 text-violet-soft" />
          </div>
          <h1 className="font-display text-display-md font-bold">
            {locale === "ru" ? "Настройки" : "Settings"}
          </h1>
        </div>
        <p className="text-ink-dim mb-6">
          {locale === "ru"
            ? "Управляй аккаунтом, профилем и предпочтениями."
            : "Manage your account, profile and preferences."}
        </p>
      </motion.div>

      {/* Account */}
      <Section
        title={locale === "ru" ? "Аккаунт" : "Account"}
        icon={<UserIcon className="size-4 text-lime" />}
      >
        <div className="flex items-center gap-4 mb-5">
          <Avatar
            name={user.name ?? user.email}
            src={user.image ?? undefined}
            size={64}
            tone="lime"
          />
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg font-semibold flex items-center gap-2 flex-wrap">
              {user.name ?? user.email}
              {user.emailVerified && (
                <Badge variant="success">
                  <CheckCircle2 className="size-3 mr-0.5" />
                  {locale === "ru" ? "верифицирован" : "verified"}
                </Badge>
              )}
              {user.plan !== "FREE" && (
                <Badge variant="lime">{user.plan}</Badge>
              )}
            </div>
            <div className="text-xs text-ink-dim flex items-center gap-1.5 mt-0.5">
              <Mail className="size-3" />
              {user.email}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm text-rose">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {savedAt && Date.now() - savedAt < 4000 && (
          <div className="mb-4 rounded-xl border border-lime/30 bg-lime/5 p-3 text-sm text-lime">
            {locale === "ru" ? "Сохранено" : "Saved"}
          </div>
        )}

        <form onSubmit={onSaveProfile} className="grid gap-3 sm:grid-cols-2">
          <Field
            label={locale === "ru" ? "Имя" : "Display name"}
            value={name}
            onChange={setName}
            placeholder="Alex"
            maxLength={80}
          />
          <Field
            label="Username"
            value={username}
            onChange={(v) =>
              setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            placeholder="alex"
            prefix={<AtSign className="size-3 text-ink-muted" />}
            maxLength={20}
          />
          <Field
            label={locale === "ru" ? "URL аватара" : "Avatar URL"}
            value={image}
            onChange={setImage}
            placeholder="https://…"
            wide
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={pending} className="gap-2">
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              {locale === "ru" ? "Сохранить" : "Save"}
            </Button>
          </div>
        </form>
      </Section>

      {/* Stats summary */}
      <Section
        title={locale === "ru" ? "Сводка" : "Summary"}
        icon={<span className="text-lime">⚡</span>}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Level" value={user.level} />
          <Stat label="XP" value={user.totalXp} />
          <Stat
            label={locale === "ru" ? "Серия" : "Streak"}
            value={user.currentStreak}
            sub={`PR ${user.bestStreak}`}
          />
          <Stat
            label={locale === "ru" ? "Заморозки" : "Freezes"}
            value={user.streakFreezes}
          />
        </div>
      </Section>

      {/* Locale */}
      <Section
        title={locale === "ru" ? "Язык" : "Language"}
        icon={<span className="text-violet-soft">🌐</span>}
      >
        <div className="flex gap-2">
          {(["ru", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLocaleChange(l)}
              className={`px-4 h-10 rounded-xl border text-sm font-medium ${
                locale === l
                  ? "border-lime/50 bg-lime/10 text-lime"
                  : "border-line bg-white/[0.02] text-ink-dim hover:text-ink"
              }`}
            >
              {l === "ru" ? "Русский" : "English"}
            </button>
          ))}
        </div>
      </Section>

      {/* Privacy */}
      <Section
        title={locale === "ru" ? "Приватность" : "Privacy"}
        icon={
          isPublic ? (
            <Eye className="size-4 text-lime" />
          ) : (
            <EyeOff className="size-4 text-ink-muted" />
          )
        }
      >
        <div className="flex flex-col gap-3">
          <PrivacyRow
            title={
              locale === "ru" ? "Публичный профиль" : "Public profile"
            }
            description={
              locale === "ru"
                ? "Любой, у кого есть ссылка fitstreak.ru/u/username, может увидеть твой уровень, серию и активность."
                : "Anyone with the fitstreak.ru/u/username link can see your level, streak and activity."
            }
            value={isPublic}
            onChange={(v) => togglePrivacy("isPublic", v)}
          />
          <PrivacyRow
            title={
              locale === "ru"
                ? "Показывать в лидерборде"
                : "Show on leaderboard"
            }
            description={
              locale === "ru"
                ? "Сними галочку — и тебя не увидят в публичных рейтингах. Личная статистика останется доступной."
                : "Uncheck to hide from public rankings. Your personal stats stay intact."
            }
            value={showOnLb}
            onChange={(v) => togglePrivacy("showOnLeaderboard", v)}
          />
        </div>
      </Section>

      {/* Data export */}
      <Section
        title={locale === "ru" ? "Экспорт данных" : "Data export"}
        icon={<Download className="size-4 text-violet-soft" />}
      >
        <p className="text-sm text-ink-dim mb-4">
          {locale === "ru"
            ? "Скачай все свои активности в формате CSV — пригодится для резервной копии или анализа."
            : "Download every activity record as CSV — handy for backups or analysis."}
        </p>
        <a href="/api/me/export" download>
          <Button variant="outline" className="gap-2" type="button">
            <Download className="size-4" />
            {locale === "ru" ? "Скачать CSV" : "Download CSV"}
          </Button>
        </a>
      </Section>

      {/* Blocks */}
      <BlocksSection locale={locale} />

      {/* Reminders quick-link */}
      <Section
        title={locale === "ru" ? "Напоминания" : "Reminders"}
        icon={<span>🔔</span>}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-ink-dim">
            {user.reminders?.enabled
              ? locale === "ru"
                ? `Включены · ${user.reminders.morningTime} / ${user.reminders.eveningTime}`
                : `Enabled · ${user.reminders.morningTime} / ${user.reminders.eveningTime}`
              : locale === "ru"
                ? "Выключены"
                : "Disabled"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/reminders")}
          >
            {locale === "ru" ? "Настроить" : "Configure"}
          </Button>
        </div>
      </Section>

      {/* Sign out */}
      <Section
        title={locale === "ru" ? "Сессия" : "Session"}
        icon={<LogOut className="size-4 text-ink-muted" />}
      >
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="gap-2"
        >
          <LogOut className="size-4" />
          {locale === "ru" ? "Выйти" : "Sign out"}
        </Button>
      </Section>

      {/* Danger zone */}
      <Section
        title={locale === "ru" ? "Опасная зона" : "Danger zone"}
        icon={<Trash2 className="size-4 text-rose" />}
        tone="danger"
      >
        <p className="text-sm text-ink-dim mb-4">
          {locale === "ru"
            ? "Удаление аккаунта необратимо. Все активности, ачивки и серия будут стёрты навсегда."
            : "Account deletion is irreversible. All activity, achievements and your streak will be wiped permanently."}
        </p>
        <Button
          variant="outline"
          onClick={onDelete}
          disabled={deletePending}
          className="gap-2 border-rose/50 text-rose hover:bg-rose/10"
        >
          {deletePending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          {deletePending
            ? locale === "ru"
              ? "Удаление…"
              : "Deleting…"
            : deleteConfirm
              ? locale === "ru"
                ? "Точно удалить? Нажмите ещё раз."
                : "Really delete? Click once more."
              : locale === "ru"
                ? "Удалить аккаунт"
                : "Delete account"}
        </Button>
      </Section>
    </main>
  );
}

function Section({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`surface mt-5 p-5 sm:p-6 ${
        tone === "danger" ? "border-rose/30" : ""
      }`}
    >
      <h2 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  maxLength,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
  maxLength?: number;
  wide?: boolean;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-sm ${wide ? "sm:col-span-2" : ""}`}
    >
      <span className="text-ink-dim">{label}</span>
      <div
        className={`flex items-center gap-2 h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 focus-within:border-lime/50 ${
          prefix ? "" : ""
        }`}
      >
        {prefix}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="flex-1 bg-transparent text-ink placeholder:text-ink-muted/60 outline-none"
        />
      </div>
    </label>
  );
}

function PrivacyRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="min-w-0 flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-ink-dim mt-1">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          value
            ? "bg-lime/30 border-lime/50"
            : "bg-white/[0.05] border-line"
        }`}
      >
        <span
          className={`absolute top-[2px] size-4 rounded-full transition-all ${
            value ? "left-[22px] bg-lime shadow-glow" : "left-[2px] bg-ink-dim"
          }`}
        />
      </button>
    </div>
  );
}

interface BlockedUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  reason: string | null;
  blockedAt: string;
}

function BlocksSection({ locale }: { locale: "ru" | "en" }) {
  const [items, setItems] = React.useState<BlockedUser[] | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const r = await fetch("/api/me/blocks");
      const j = await r.json().catch(() => null);
      setItems(j?.items ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const unblock = async (userId: string) => {
    setItems((prev) => prev?.filter((u) => u.id !== userId) ?? null);
    try {
      await fetch(`/api/block/${userId}`, { method: "DELETE" });
    } catch {
      void refresh();
    }
  };

  return (
    <Section
      title={locale === "ru" ? "Заблокированные" : "Blocked users"}
      icon={<Ban className="size-4 text-rose" />}
    >
      {!items ? (
        <div className="grid place-items-center py-4 text-ink-muted">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-dim">
          {locale === "ru"
            ? "Никто не заблокирован."
            : "No one is blocked."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-2.5"
            >
              <Avatar
                name={u.name}
                src={u.image ?? undefined}
                size={36}
              />
              <div className="flex-1 min-w-0">
                {u.username ? (
                  <Link
                    href={`/u/${u.username}`}
                    className="font-medium text-sm hover:text-lime"
                  >
                    {u.name}
                  </Link>
                ) : (
                  <span className="font-medium text-sm">{u.name}</span>
                )}
                <div className="text-xs text-ink-muted">
                  @{u.username ?? "user"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => unblock(u.id)}
              >
                {locale === "ru" ? "Разблокировать" : "Unblock"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold number-tabular">
        {value}
      </div>
      {sub && <div className="text-xs text-ink-muted mt-0.5">{sub}</div>}
    </div>
  );
}
