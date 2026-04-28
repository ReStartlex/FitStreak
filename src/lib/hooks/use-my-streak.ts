"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

export interface MyStreak {
  currentStreak: number;
  bestStreak: number;
  level: number;
  levelProgressPct: number;
  username: string | null;
}

const CACHE_TTL_MS = 30_000;
const REFRESH_INTERVAL_MS = 60_000;

let cache: { at: number; data: MyStreak } | null = null;
let inflight: Promise<MyStreak> | null = null;

type Subscriber = (data: MyStreak | null) => void;
const subscribers = new Set<Subscriber>();

async function fetchStreak(): Promise<MyStreak> {
  const res = await fetch("/api/me/streak", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MyStreak;
}

function startInflight(): Promise<MyStreak> {
  if (inflight) return inflight;
  inflight = fetchStreak()
    .then((d) => {
      cache = { at: Date.now(), data: d };
      subscribers.forEach((cb) => cb(d));
      return d;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Globally-callable invalidator — useful from non-React code (e.g.
 * activity-service successCallback) or from any sibling component
 * that knows the streak just changed.
 */
export function invalidateMyStreak(): void {
  cache = null;
  void startInflight().catch(() => {
    /* non-critical chip */
  });
}

/**
 * Lightweight per-tab cache for the global Header chip. Only fires
 * when the user is authenticated; bumps every 60s if the page stays
 * open and refetches on focus/visibility.
 */
export function useMyStreak() {
  const { status } = useSession();
  const [data, setData] = React.useState<MyStreak | null>(
    cache && Date.now() - cache.at < CACHE_TTL_MS ? cache.data : null,
  );

  const refresh = React.useCallback(() => {
    void startInflight().catch(() => {
      /* non-critical chip */
    });
  }, []);

  React.useEffect(() => {
    if (status !== "authenticated") return;

    const sub: Subscriber = (d) => setData(d);
    subscribers.add(sub);

    if (!cache || Date.now() - cache.at > CACHE_TTL_MS) {
      refresh();
    } else {
      setData(cache.data);
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_INTERVAL_MS);
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      subscribers.delete(sub);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [status, refresh]);

  return { data, refresh };
}
