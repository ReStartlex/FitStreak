"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/provider";

interface TopUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  currentStreak: number;
  bestStreak: number;
  level: number;
}

/**
 * Real "top streak holders" snapshot — sourced from the database
 * via /api/community/top-streaks. Renders nothing while there are
 * no users with an active streak yet, so the landing never shows
 * an empty placeholder.
 */
export function TopStreaks() {
  const { t, locale } = useI18n();
  const [users, setUsers] = React.useState<TopUser[] | null>(null);

  React.useEffect(() => {
    fetch("/api/community/top-streaks", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setUsers((j?.users as TopUser[] | undefined) ?? []))
      .catch(() => setUsers([]));
  }, []);

  if (!users || users.length === 0) return null;

  return (
    <Section
      eyebrow={
        <span className="inline-flex items-center gap-1.5">
          <Flame className="size-3.5 text-accent-orange" />
          {locale === "ru" ? "В огне" : "On fire"}
        </span>
      }
      title={
        locale === "ru"
          ? "Сейчас держат серию"
          : "Holding the streak right now"
      }
      subtitle={
        locale === "ru"
          ? "Реальные пользователи с самой длинной активной серией. Догоняй."
          : "Real users with the longest live streaks. Catch up."
      }
    >
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {users.map((u, i) => (
          <Link
            key={u.id}
            href={u.username ? `/u/${u.username}` : "/leaderboard"}
            className="block"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="surface p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-line-strong transition-colors h-full"
            >
              <div className="relative shrink-0">
                <Avatar
                  name={u.name}
                  src={u.image ?? undefined}
                  size={48}
                  tone={i === 0 ? "lime" : i < 3 ? "violet" : "default"}
                />
                {i === 0 && (
                  <span className="absolute -top-1 -right-1 grid place-items-center size-5 rounded-full bg-lime text-bg shadow-glow">
                    <Trophy className="size-3" />
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-sm truncate">{u.name}</span>
                {u.username && (
                  <span className="text-xs text-ink-muted truncate">
                    @{u.username}
                  </span>
                )}
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={i < 3 ? "lime" : "outline"}
                    className="gap-1"
                  >
                    <Flame className="size-3" />
                    <span className="number-tabular">{u.currentStreak}</span>
                    <span className="text-[10px] opacity-80">
                      {locale === "ru" ? "д" : "d"}
                    </span>
                  </Badge>
                  <span className="text-[10px] text-ink-muted">
                    {t.common.level} {u.level}
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
