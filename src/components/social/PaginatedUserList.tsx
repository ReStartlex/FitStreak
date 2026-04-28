"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { UserList, type SocialUser } from "@/components/social/UserList";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";

interface PageResp {
  users: SocialUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface Props {
  /** "/api/users/<username>/followers" or ".../following". */
  endpoint: string;
  initialUsers: SocialUser[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

/**
 * Client-side wrapper around `<UserList>` that progressively loads
 * additional pages. Uses an IntersectionObserver-driven sentinel so
 * the user just keeps scrolling — with a fallback "Show more" button
 * for keyboard / no-IO environments.
 */
export function PaginatedUserList({
  endpoint,
  initialUsers,
  initialCursor,
  initialHasMore,
}: Props) {
  const { locale } = useI18n();
  const [users, setUsers] = React.useState<SocialUser[]>(initialUsers);
  const [cursor, setCursor] = React.useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = React.useState(initialHasMore);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set("limit", "30");
      if (cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as PageResp;
      setUsers((u) => {
        const seen = new Set(u.map((x) => x.id));
        const fresh = json.users.filter((x) => !seen.has(x.id));
        return [...u, ...fresh];
      });
      setCursor(json.nextCursor);
      setHasMore(json.hasMore);
    } catch {
      setError(
        locale === "ru" ? "Не получилось загрузить" : "Couldn't load more",
      );
    } finally {
      setLoading(false);
    }
  }, [cursor, endpoint, hasMore, loading, locale]);

  // Auto-load when the sentinel appears in view.
  React.useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <UserList users={users} />

      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-4 flex flex-col items-center gap-2"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <Loader2 className="size-4 animate-spin" />
              {locale === "ru" ? "Загружаем…" : "Loading…"}
            </span>
          ) : error ? (
            <>
              <span className="text-sm text-rose">{error}</span>
              <Button variant="outline" size="sm" onClick={loadMore}>
                {locale === "ru" ? "Повторить" : "Retry"}
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={loadMore}>
              {locale === "ru" ? "Показать ещё" : "Show more"}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
