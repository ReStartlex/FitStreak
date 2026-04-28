"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const EMOJIS = [
  { id: "FIRE", glyph: "🔥" },
  { id: "CLAP", glyph: "👏" },
  { id: "STRONG", glyph: "💪" },
  { id: "HEART", glyph: "❤️" },
  { id: "ROCKET", glyph: "🚀" },
] as const;

type EmojiId = (typeof EMOJIS)[number]["id"];

interface Props {
  recordId: string;
  isOwn: boolean;
  /** Initial counts from a parent fetch — optional; otherwise we'll lazy-load. */
  initialCounts?: Record<string, number>;
  initialMy?: string[];
}

/**
 * Tiny reactions strip used on FriendsFeed entries. Lazy-fetches state
 * on first interaction when not provided. Hidden for the user's own
 * activity (no point reacting to yourself).
 */
export function Reactions({
  recordId,
  isOwn,
  initialCounts,
  initialMy,
}: Props) {
  const { status } = useSession();
  const [counts, setCounts] = React.useState<Record<string, number>>(
    initialCounts ?? {},
  );
  const [mine, setMine] = React.useState<Set<string>>(
    new Set(initialMy ?? []),
  );
  const [loaded, setLoaded] = React.useState(Boolean(initialCounts));
  const [open, setOpen] = React.useState(false);

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const ensureLoaded = React.useCallback(async () => {
    if (loaded) return;
    try {
      const res = await fetch(`/api/activity/${recordId}/reactions`);
      if (res.ok) {
        const json = (await res.json()) as {
          counts: Record<string, number>;
          my: string[];
        };
        setCounts(json.counts);
        setMine(new Set(json.my));
      }
    } finally {
      setLoaded(true);
    }
  }, [loaded, recordId]);

  async function toggle(emoji: EmojiId) {
    if (status !== "authenticated" || isOwn) return;
    // Optimistic
    const has = mine.has(emoji);
    const nextMine = new Set(mine);
    if (has) nextMine.delete(emoji);
    else nextMine.add(emoji);
    setMine(nextMine);
    setCounts((c) => ({
      ...c,
      [emoji]: Math.max(0, (c[emoji] ?? 0) + (has ? -1 : 1)),
    }));

    try {
      await fetch(`/api/activity/${recordId}/reactions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // revert
      setMine(mine);
    }
  }

  if (isOwn) {
    if (totalCount === 0) return null;
    return (
      <div className="flex gap-1 mt-1">
        {EMOJIS.filter((e) => (counts[e.id] ?? 0) > 0).map((e) => (
          <span
            key={e.id}
            className="inline-flex items-center gap-0.5 text-[11px] rounded-full px-2 py-0.5 bg-white/[0.04] border border-line"
          >
            <span>{e.glyph}</span>
            <span className="number-tabular text-ink-dim">
              {counts[e.id]}
            </span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 mt-1"
      onMouseEnter={() => {
        ensureLoaded();
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        ensureLoaded();
        setOpen(true);
      }}
    >
      {/* Existing reactions */}
      {EMOJIS.filter((e) => (counts[e.id] ?? 0) > 0).map((e) => {
        const active = mine.has(e.id);
        return (
          <button
            key={e.id}
            type="button"
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              toggle(e.id);
            }}
            className={`inline-flex items-center gap-0.5 text-[11px] rounded-full px-2 py-0.5 border transition-colors ${
              active
                ? "border-lime/50 bg-lime/15 text-lime"
                : "border-line bg-white/[0.04] text-ink-dim hover:bg-white/[0.08]"
            }`}
          >
            <span>{e.glyph}</span>
            <span className="number-tabular">{counts[e.id]}</span>
          </button>
        );
      })}
      {/* Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            ensureLoaded();
            setOpen((v) => !v);
          }}
          className="text-[11px] rounded-full px-2 py-0.5 border border-line bg-white/[0.04] text-ink-muted hover:text-ink hover:bg-white/[0.08]"
          aria-label="React"
        >
          + 😀
        </button>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-30 left-0 mt-1 flex gap-1 px-2 py-1.5 rounded-full border border-line bg-bg-card/95 backdrop-blur-2xl shadow-soft"
          >
            {EMOJIS.map((e) => {
              const active = mine.has(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggle(e.id);
                  }}
                  className={`text-base hover:scale-125 transition-transform ${
                    active ? "drop-shadow-[0_0_6px_rgba(198,255,61,0.6)]" : ""
                  }`}
                >
                  {e.glyph}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
