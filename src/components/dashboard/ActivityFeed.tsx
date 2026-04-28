"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { EXERCISES, exerciseUnitLabel } from "@/lib/mock/exercises";
import { calcEnergyScore, calcXP } from "@/lib/scoring";
import { useToast } from "@/components/ui/Toast";

export interface FeedRecord {
  id: string;
  exerciseId: string;
  amount: number;
  energy?: number;
  xp?: number;
  recordedAt: string | Date;
}

export interface FeedTotals {
  totalEnergy: number;
  totalXp: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
}

export type FeedMutationEvent =
  | { kind: "delete"; id: string; totals: FeedTotals }
  | {
      kind: "update";
      id: string;
      amount: number;
      energy: number;
      xp: number;
      totals: FeedTotals;
    };

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

function formatTime(date: Date, locale: "ru" | "en") {
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const todayLabel = locale === "ru" ? "Сегодня" : "Today";
  const yesterdayLabel = locale === "ru" ? "Вчера" : "Yesterday";
  const day = sameDay
    ? todayLabel
    : isYesterday
      ? yesterdayLabel
      : date.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return `${day} · ${time}`;
}

interface FeedProps {
  records?: FeedRecord[];
  onMutated?: (event: FeedMutationEvent) => void;
}

export function ActivityFeed({ records, onMutated }: FeedProps) {
  const { t, locale } = useI18n();
  const all = records ?? [];

  if (all.length === 0) {
    return (
      <div className="surface p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold mb-1">
          {t.dashboard.historyTitle}
        </h3>
        <p className="text-xs text-ink-dim">{t.dashboard.historySubtitle}</p>
        <div className="mt-6 rounded-xl border border-line bg-white/[0.02] p-6 text-center text-sm text-ink-muted">
          {locale === "ru"
            ? "Пока пусто. Запиши первое действие — здесь появится история."
            : "Nothing yet. Log your first activity to see history here."}
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold">
            {t.dashboard.historyTitle}
          </h3>
          <p className="text-xs text-ink-dim">{t.dashboard.historySubtitle}</p>
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {all.slice(0, 12).map((rec, i) => (
            <FeedRow
              key={rec.id}
              rec={rec}
              index={i}
              locale={locale}
              onMutated={onMutated}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function FeedRow({
  rec,
  index,
  locale,
  onMutated,
}: {
  rec: FeedRecord;
  index: number;
  locale: "ru" | "en";
  onMutated?: (event: FeedMutationEvent) => void;
}) {
  const toast = useToast();
  const [editing, setEditing] = React.useState(false);
  const [busy, setBusy] = React.useState<"delete" | "save" | null>(null);
  const [draft, setDraft] = React.useState(String(rec.amount));

  const ex = EXERCISES.find((e) => e.id === rec.exerciseId);
  if (!ex) return null;
  const Icon = ex.icon;
  const tone = {
    lime: "border-lime/30 text-lime bg-lime/10",
    violet: "border-violet/30 text-violet-soft bg-violet/10",
    rose: "border-accent-rose/30 text-accent-rose bg-accent-rose/10",
    cyan: "border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10",
    orange: "border-accent-orange/30 text-accent-orange bg-accent-orange/10",
  }[ex.tone];

  const unit = exerciseUnitLabel(ex, locale);
  const energy = rec.energy ?? calcEnergyScore(ex.id, rec.amount);
  const xp = rec.xp ?? calcXP(ex.id, rec.amount);
  const dt =
    typeof rec.recordedAt === "string" ? new Date(rec.recordedAt) : rec.recordedAt;

  const editable =
    Date.now() - new Date(dt).getTime() < EDIT_WINDOW_MS && !!onMutated;

  async function handleDelete() {
    if (busy) return;
    const confirmText =
      locale === "ru"
        ? "Удалить эту запись? Очки за неё будут вычтены."
        : "Delete this entry? Its points will be subtracted.";
    if (!window.confirm(confirmText)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/activity/${rec.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete_failed");
      const json = (await res.json()) as { totals: FeedTotals };
      onMutated?.({ kind: "delete", id: rec.id, totals: json.totals });
      toast(locale === "ru" ? "Запись удалена" : "Entry deleted", {
        tone: "info",
      });
    } catch {
      toast(
        locale === "ru" ? "Не удалось удалить" : "Couldn't delete entry",
        { tone: "error" },
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleSave() {
    const next = Number(draft);
    if (!Number.isFinite(next) || next <= 0) {
      toast(
        locale === "ru"
          ? "Количество должно быть больше нуля"
          : "Amount must be positive",
        { tone: "error" },
      );
      return;
    }
    if (next === rec.amount) {
      setEditing(false);
      return;
    }
    setBusy("save");
    try {
      const res = await fetch(`/api/activity/${rec.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: next }),
      });
      if (!res.ok) throw new Error("update_failed");
      const json = (await res.json()) as {
        record: { id: string; amount: number; energy: number; xp: number };
        totals: FeedTotals;
      };
      onMutated?.({
        kind: "update",
        id: rec.id,
        amount: json.record.amount,
        energy: json.record.energy,
        xp: json.record.xp,
        totals: json.totals,
      });
      setEditing(false);
      toast(locale === "ru" ? "Сохранено" : "Saved", { tone: "success" });
    } catch {
      toast(
        locale === "ru" ? "Не удалось сохранить" : "Couldn't save changes",
        { tone: "error" },
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      transition={{ duration: 0.25, delay: editing ? 0 : Math.min(index, 6) * 0.02 }}
      className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03]"
    >
      <div className={`size-9 grid place-items-center rounded-xl border ${tone}`}>
        <Icon className="size-4" />
      </div>

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 rounded-lg bg-white/[0.04] border border-line px-2 py-1.5 text-sm number-tabular focus:outline-none focus:border-lime/60"
            autoFocus
          />
          <span className="text-xs text-ink-dim">{unit}</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy === "save"}
            aria-label={locale === "ru" ? "Сохранить" : "Save"}
            className="size-8 grid place-items-center rounded-lg border border-lime/30 bg-lime/10 text-lime hover:bg-lime/20 disabled:opacity-50"
          >
            {busy === "save" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setDraft(String(rec.amount));
            }}
            aria-label={locale === "ru" ? "Отмена" : "Cancel"}
            className="size-8 grid place-items-center rounded-lg border border-line text-ink-muted hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              +{rec.amount} {unit}{" "}
              <span className="text-ink-dim font-normal">
                · {locale === "ru" ? ex.nameRu : ex.nameEn}
              </span>
            </div>
            <div className="text-xs text-ink-muted flex items-center gap-2 flex-wrap">
              <span>{formatTime(dt, locale)}</span>
              <span className="text-lime/80 number-tabular">+{energy} ES</span>
              <span className="text-violet-soft/80 number-tabular">+{xp} XP</span>
            </div>
          </div>

          {editable ? (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={locale === "ru" ? "Изменить" : "Edit"}
                className="size-8 grid place-items-center rounded-lg border border-line/60 text-ink-muted hover:text-ink hover:border-line"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy === "delete"}
                aria-label={locale === "ru" ? "Удалить" : "Delete"}
                className="size-8 grid place-items-center rounded-lg border border-accent-rose/30 text-accent-rose hover:bg-accent-rose/10 disabled:opacity-50"
              >
                {busy === "delete" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </button>
            </div>
          ) : (
            <Clock className="size-3.5 text-ink-muted shrink-0" />
          )}
        </>
      )}
    </motion.li>
  );
}
