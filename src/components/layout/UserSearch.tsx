"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Loader2, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

interface FoundUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  level: number;
  currentStreak: number;
}

/**
 * Header autocomplete: 2+ char debounced query → /api/users/search.
 * Pure client UI — no SWR/dep, just a tiny `q -> setTimeout` lookup.
 */
export function UserSearch({ compact = false }: { compact?: boolean }) {
  const { locale } = useI18n();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<FoundUser[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctl = new AbortController();
    const tid = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ctl.signal },
        );
        if (res.ok) {
          const data = (await res.json()) as { users: FoundUser[] };
          setResults(data.users);
        }
      } catch {
        // ignore aborted/network failures
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      window.clearTimeout(tid);
      ctl.abort();
    };
  }, [query]);

  return (
    <div ref={wrapRef} className={cn("relative", compact ? "w-full" : "w-64")}>
      <div className="flex items-center gap-2 h-9 px-3 rounded-full border border-line bg-white/[0.04] focus-within:border-line-strong focus-within:bg-white/[0.08]">
        <Search className="size-3.5 text-ink-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            locale === "ru" ? "Поиск пользователей" : "Search users"
          }
          className="flex-1 bg-transparent text-sm placeholder:text-ink-muted focus:outline-none"
        />
        {loading && (
          <Loader2 className="size-3.5 text-ink-muted animate-spin shrink-0" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="text-ink-muted hover:text-ink"
            aria-label="Clear"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[60vh] overflow-y-auto rounded-2xl border border-line bg-bg-card/95 backdrop-blur-2xl shadow-glow z-50">
          {results.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-sm text-ink-muted">
              {locale === "ru" ? "Никого не нашли" : "No users found"}
            </div>
          )}
          {results.map((u) => (
            <Link
              key={u.id}
              href={u.username ? `/u/${u.username}` : "#"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05]"
            >
              <Avatar
                name={u.name}
                src={u.image ?? undefined}
                size={36}
                tone={u.currentStreak >= 30 ? "lime" : "default"}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{u.name}</div>
                {u.username && (
                  <div className="text-xs text-ink-muted truncate">
                    @{u.username}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-ink-dim">
                <span className="number-tabular">lv {u.level}</span>
                {u.currentStreak > 0 && (
                  <span className="text-accent-orange number-tabular">
                    🔥 {u.currentStreak}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
