"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Flame, Sparkles, Trophy, Snowflake } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";
import { divisionName, getDivision } from "@/lib/ranks";

export type CelebrationKind =
  | { type: "level-up"; level: number }
  | { type: "goal-reached"; goal: number; energy: number }
  | { type: "freeze-used"; remaining: number }
  | { type: "freeze-earned"; remaining: number };

interface Props {
  event: CelebrationKind | null;
  onClose: () => void;
}

const COLORS = [
  "#C8FF36", // lime
  "#9B6CFF", // violet
  "#FFB236", // orange
  "#FF6E89", // rose
  "#7DE3FF", // cyan
  "#FFE25C", // yellow
];

function Confetti({ count = 80 }: { count?: number }) {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const distance = 280 + Math.random() * 220;
        return {
          id: i,
          color: COLORS[i % COLORS.length],
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance + Math.random() * 80,
          rotate: Math.random() * 720 - 360,
          delay: Math.random() * 0.18,
          size: 6 + Math.random() * 6,
          shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "square" : "bar",
        };
      }),
    [count],
  );
  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none grid place-items-center">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.6],
            rotate: p.rotate,
          }}
          transition={{ duration: 1.4, delay: p.delay, ease: "easeOut" }}
          style={{
            width: p.size,
            height: p.shape === "bar" ? p.size * 0.4 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "9999px" : "2px",
            boxShadow: `0 0 12px ${p.color}66`,
          }}
          className="absolute"
        />
      ))}
    </div>
  );
}

export function CelebrationOverlay({ event, onClose }: Props) {
  const { t } = useI18n();

  // Auto-close after 4.5s for non-blocking feel.
  React.useEffect(() => {
    if (!event) return;
    const id = setTimeout(onClose, 4500);
    return () => clearTimeout(id);
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <Confetti
            count={
              event.type === "level-up" ? 110 : event.type === "goal-reached" ? 80 : 50
            }
          />
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md mx-4 surface p-8 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-lime opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-violet opacity-25 pointer-events-none" />

            {event.type === "level-up" && <LevelUpBody level={event.level} />}
            {event.type === "goal-reached" && (
              <GoalBody goal={event.goal} energy={event.energy} />
            )}
            {event.type === "freeze-used" && (
              <FreezeUsedBody remaining={event.remaining} />
            )}
            {event.type === "freeze-earned" && (
              <FreezeEarnedBody remaining={event.remaining} />
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={onClose}
              className="relative mt-7 w-full"
            >
              {t.levels.keepGoing}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LevelUpBody({ level }: { level: number }) {
  const { t, locale } = useI18n();
  const division = getDivision(level);
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="size-24 mx-auto rounded-full grid place-items-center bg-lime/15 border-2 border-lime/60 shadow-glow"
      >
        <Crown className="size-12 text-lime" strokeWidth={2.4} />
      </motion.div>
      <div className="text-xs uppercase tracking-[0.25em] text-ink-muted mt-5">
        {t.levels.levelUp}
      </div>
      <h2 className="font-display text-4xl sm:text-5xl font-bold mt-1 leading-none">
        <span className="text-gradient-lime">
          {t.levels.levelUpReached.replace("{level}", String(level))}
        </span>
      </h2>
      <div className="mt-3 text-sm text-ink-dim">{t.levels.levelUpDesc}</div>
      <div className="mt-4 inline-flex items-center gap-2 chip">
        <Trophy className="size-3.5 text-violet-soft" />
        {divisionName(division, locale)}
      </div>
    </div>
  );
}

function GoalBody({ goal, energy }: { goal: number; energy: number }) {
  const { t } = useI18n();
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="size-24 mx-auto rounded-full grid place-items-center bg-lime/20 border-2 border-lime/60 shadow-glow"
      >
        <Sparkles className="size-12 text-lime" strokeWidth={2.4} />
      </motion.div>
      <div className="text-xs uppercase tracking-[0.25em] text-ink-muted mt-5">
        100%
      </div>
      <h2 className="font-display text-3xl sm:text-4xl font-bold mt-1 leading-tight">
        <span className="text-gradient-lime">{t.levels.goalReachedTitle}</span>
      </h2>
      <div className="mt-3 text-sm text-ink-dim">{t.levels.goalReachedDesc}</div>
      <div className="mt-4 flex items-center justify-center gap-3 text-sm text-ink-dim">
        <Flame className="size-4 text-accent-orange" />
        <span className="number-tabular">
          {energy} / {goal} ES
        </span>
      </div>
    </div>
  );
}

function FreezeUsedBody({ remaining }: { remaining: number }) {
  const { t } = useI18n();
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="size-24 mx-auto rounded-full grid place-items-center bg-cyan/15 border-2 border-cyan/60 shadow-glow"
        style={{ borderColor: "#7de3ff", backgroundColor: "rgba(125,227,255,0.15)" }}
      >
        <Snowflake className="size-12" strokeWidth={2.4} style={{ color: "#7de3ff" }} />
      </motion.div>
      <h2 className="font-display text-3xl font-bold mt-5 leading-tight">
        {t.streak.freezeAuto}
      </h2>
      <div className="mt-3 text-sm text-ink-dim">{t.streak.freezeUsedToast}</div>
      <div className="mt-4 chip">
        ❄ {remaining}{" "}
        {pluralize(remaining, t.streak.freezeWord1, t.streak.freezeWord2, t.streak.freezeWord5)}
      </div>
    </div>
  );
}

function FreezeEarnedBody({ remaining }: { remaining: number }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="size-24 mx-auto rounded-full grid place-items-center"
        style={{ borderColor: "#7de3ff", backgroundColor: "rgba(125,227,255,0.15)", borderWidth: 2, borderStyle: "solid" }}
      >
        <Snowflake className="size-12" strokeWidth={2.4} style={{ color: "#7de3ff" }} />
      </motion.div>
      <h2 className="font-display text-3xl font-bold mt-5">+1 freeze</h2>
      <div className="mt-3 text-sm text-ink-dim">
        Now you have {remaining} freeze{remaining === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
