"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check, Flame, Trophy, UserPlus, Award, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

type NotifType =
  | "FOLLOW"
  | "LEVEL_UP"
  | "ACHIEVEMENT"
  | "STREAK_MILESTONE"
  | "STREAK_AT_RISK"
  | "CHALLENGE_DONE"
  | "CHALLENGE_INVITE"
  | "LEADERBOARD_OVERTAKE"
  | "SYSTEM";

interface NotifActor {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
}

interface NotifItem {
  id: string;
  type: NotifType;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  actor: NotifActor | null;
}

interface NotifResp {
  unreadCount: number;
  items: NotifItem[];
}

const POLL_MS = 60_000;

function relTime(iso: string, locale: "ru" | "en"): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(1, Math.round(ms / 1000));
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (locale === "ru") {
    if (sec < 60) return "только что";
    if (min < 60) return `${min} мин`;
    if (hr < 24) return `${hr} ч`;
    return `${day} дн.`;
  }
  if (sec < 60) return "just now";
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  return `${day}d`;
}

export function NotificationsBell() {
  const { status } = useSession();
  const { locale } = useI18n();
  const [data, setData] = React.useState<NotifResp | null>(null);
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifs = React.useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/notifications?limit=20", {
        cache: "no-store",
      });
      if (res.ok) setData((await res.json()) as NotifResp);
    } catch {
      /* network — ignore */
    }
  }, [status]);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotifs();
    const tid = window.setInterval(fetchNotifs, POLL_MS);
    return () => window.clearInterval(tid);
  }, [status, fetchNotifs]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function markAllRead() {
    if (!data?.unreadCount) return;
    setData((d) =>
      d
        ? {
            unreadCount: 0,
            items: d.items.map((i) =>
              i.readAt ? i : { ...i, readAt: new Date().toISOString() },
            ),
          }
        : d,
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch {
      /* ignore */
    }
  }

  if (status !== "authenticated") return null;

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) {
            // pre-fetch when opening so the list isn't stale
            fetchNotifs();
          }
        }}
        className={cn(
          "relative grid place-items-center size-9 rounded-full border transition-colors",
          unread > 0
            ? "border-lime/60 bg-lime/15 text-lime"
            : "border-line bg-white/[0.04] hover:bg-white/[0.08] text-ink-dim",
        )}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-lime text-bg text-[10px] font-bold">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-bg-card/95 backdrop-blur-2xl shadow-glow z-50">
          <div className="flex items-center justify-between px-4 h-12 border-b border-line">
            <span className="text-sm font-semibold">
              {locale === "ru" ? "Уведомления" : "Notifications"}
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
              >
                <Check className="size-3" />
                {locale === "ru" ? "Всё прочитано" : "Mark all read"}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-muted">
              {locale === "ru" ? "Пока тихо" : "All quiet here"}
            </div>
          ) : (
            <ul className="divide-y divide-line/60">
              {items.map((n) => (
                <NotifItem key={n.id} item={n} locale={locale} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotifItem({
  item,
  locale,
}: {
  item: NotifItem;
  locale: "ru" | "en";
}) {
  const { primary, body, href, icon } = describe(item, locale);
  const inner = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04]",
        !item.readAt && "bg-lime/[0.03]",
      )}
    >
      {item.actor ? (
        <Avatar
          name={item.actor.name}
          src={item.actor.image ?? undefined}
          size={36}
        />
      ) : (
        <div className="size-9 grid place-items-center rounded-full border border-line bg-white/[0.04]">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm leading-snug">
          <span className="font-semibold">{primary}</span>
          {body && <span className="text-ink-dim"> · {body}</span>}
        </div>
        <div className="text-[11px] text-ink-muted mt-0.5">
          {relTime(item.createdAt, locale)}
        </div>
      </div>
      {!item.readAt && (
        <span className="size-2 rounded-full bg-lime mt-2 shrink-0" />
      )}
    </div>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}

function describe(
  n: NotifItem,
  locale: "ru" | "en",
): { primary: string; body?: string; href?: string; icon: React.ReactNode } {
  const actorName = n.actor?.name ?? "—";
  const actorHref = n.actor?.username ? `/u/${n.actor.username}` : undefined;
  switch (n.type) {
    case "FOLLOW":
      return {
        primary: actorName,
        body: locale === "ru" ? "подписался на тебя" : "started following you",
        href: actorHref,
        icon: <UserPlus className="size-4 text-lime" />,
      };
    case "LEVEL_UP":
      return {
        primary:
          locale === "ru"
            ? `Уровень ${(n.data?.level as number) ?? "?"}`
            : `Level ${(n.data?.level as number) ?? "?"}`,
        body: locale === "ru" ? "Ты прокачался" : "You levelled up",
        href: "/dashboard",
        icon: <Zap className="size-4 text-violet-soft" />,
      };
    case "ACHIEVEMENT":
      return {
        primary: locale === "ru" ? "Новая ачивка" : "New achievement",
        body: (n.data?.title as string) ?? "",
        href: "/dashboard",
        icon: <Award className="size-4 text-accent-orange" />,
      };
    case "STREAK_MILESTONE":
      return {
        primary:
          locale === "ru"
            ? `Серия ${(n.data?.streak as number) ?? ""} дн.`
            : `${(n.data?.streak as number) ?? ""}-day streak`,
        body: locale === "ru" ? "Так держать" : "Keep going!",
        href: "/dashboard",
        icon: <Flame className="size-4 text-accent-orange" />,
      };
    case "STREAK_AT_RISK":
      return {
        primary: locale === "ru" ? "Серия под угрозой" : "Streak at risk",
        body:
          locale === "ru"
            ? "Запиши активность сегодня"
            : "Log activity today",
        href: "/dashboard",
        icon: <Flame className="size-4 text-accent-rose" />,
      };
    case "CHALLENGE_DONE":
      return {
        primary: locale === "ru" ? "Челлендж пройден" : "Challenge complete",
        body: (n.data?.title as string) ?? "",
        href: "/challenges",
        icon: <Trophy className="size-4 text-lime" />,
      };
    case "LEADERBOARD_OVERTAKE":
      return {
        primary: actorName,
        body:
          locale === "ru"
            ? "обогнал тебя в рейтинге"
            : "passed you on the leaderboard",
        href: "/leaderboard",
        icon: <Trophy className="size-4 text-violet-soft" />,
      };
    case "CHALLENGE_INVITE":
      return {
        primary: locale === "ru" ? "Приглашение" : "Invite",
        body: (n.data?.title as string) ?? "",
        href: "/challenges",
        icon: <Trophy className="size-4 text-lime" />,
      };
    case "SYSTEM":
    default:
      return {
        primary: (n.data?.title as string) ?? "FitStreak",
        body: (n.data?.body as string) ?? "",
        icon: <Bell className="size-4 text-ink-dim" />,
      };
  }
}
