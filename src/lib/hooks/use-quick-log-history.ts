"use client";

import * as React from "react";

const STORAGE_KEY = "fitstreak.quicklog.history";
const MAX_ENTRIES = 50;
const TOP_K = 4;

interface HistoryEntry {
  exerciseId: string;
  amount: number;
  count: number;
  lastUsedAt: number;
}

/**
 * Lightweight client-side tracker for quick-log presets.
 *
 * We store per-(exerciseId, amount) tap counts in localStorage and
 * surface the top N as "your favourites" chips above the QuickLog
 * grid. Falls back gracefully when localStorage is unavailable
 * (e.g. SSR, Safari private mode).
 *
 * Combines two signals:
 *   - frequency (how often the user used this combo)
 *   - recency  (penalised if not used in the last 30 days)
 */
export function useQuickLogHistory() {
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryEntry[];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {
      // bad json, ignore
    }
  }, []);

  const persist = React.useCallback((next: HistoryEntry[]) => {
    setHistory(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // quota or private mode — skip silently.
    }
  }, []);

  const record = React.useCallback(
    (exerciseId: string, amount: number) => {
      const now = Date.now();
      const next = [...history];
      const idx = next.findIndex(
        (e) => e.exerciseId === exerciseId && e.amount === amount,
      );
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          count: next[idx].count + 1,
          lastUsedAt: now,
        };
      } else {
        next.push({ exerciseId, amount, count: 1, lastUsedAt: now });
      }
      // Trim if we exceed the cap (drop lowest count).
      if (next.length > MAX_ENTRIES) {
        next.sort((a, b) => a.count - b.count);
        next.splice(0, next.length - MAX_ENTRIES);
      }
      persist(next);
    },
    [history, persist],
  );

  const top = React.useMemo(() => {
    const now = Date.now();
    const MONTH_MS = 30 * 86_400_000;
    return [...history]
      .map((e) => {
        const age = now - e.lastUsedAt;
        // Soft decay: entries older than 30 days lose half their weight.
        const recencyMult = age > MONTH_MS ? 0.5 : 1;
        return { ...e, score: e.count * recencyMult };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);
  }, [history]);

  return { top, record };
}
