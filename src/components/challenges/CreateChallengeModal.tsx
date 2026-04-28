"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";

type Metric = "REPS" | "MINUTES" | "ENERGY" | "STREAK_DAYS" | "DAYS_ACTIVE" | "KM";
type Difficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateChallengeModal({ open, onClose }: Props) {
  const { locale } = useI18n();
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [metric, setMetric] = React.useState<Metric>("REPS");
  const [exerciseId, setExerciseId] = React.useState<string>("pushups");
  const [goal, setGoal] = React.useState<number>(100);
  const [days, setDays] = React.useState<number>(7);
  const [difficulty, setDifficulty] = React.useState<Difficulty>("MEDIUM");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      // reset on close
      setError(null);
      setPending(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const body: Record<string, unknown> = {
        titleRu: title,
        titleEn: title,
        descRu: desc || undefined,
        metric,
        goal,
        durationDays: days,
        difficulty,
        type: "PERSONAL",
        rewardXp: Math.min(2000, goal),
      };
      if (
        metric === "REPS" ||
        metric === "MINUTES" ||
        metric === "KM"
      ) {
        body.exerciseId = exerciseId;
      }
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error?.message ?? "DEFAULT");
        setPending(false);
        return;
      }
      onClose();
      router.refresh();
      // Optional: jump straight into the new challenge
      const id = json?.data?.id ?? json?.id;
      if (id) {
        router.push(`/challenges/${id}`);
      }
    } catch {
      setError("DEFAULT");
      setPending(false);
    }
  };

  const metricLabels: Record<Metric, { ru: string; en: string }> = {
    REPS: { ru: "Повторения", en: "Reps" },
    MINUTES: { ru: "Минуты", en: "Minutes" },
    ENERGY: { ru: "Energy Score", en: "Energy Score" },
    STREAK_DAYS: { ru: "Дней подряд", en: "Streak days" },
    DAYS_ACTIVE: { ru: "Активных дней", en: "Active days" },
    KM: { ru: "Километры", en: "Kilometers" },
  };
  const exerciseOptions = [
    { id: "pushups", ru: "Отжимания", en: "Push-ups" },
    { id: "pullups", ru: "Подтягивания", en: "Pull-ups" },
    { id: "squats", ru: "Приседания", en: "Squats" },
    { id: "plank", ru: "Планка", en: "Plank" },
    { id: "abs", ru: "Пресс / скручивания", en: "Crunches" },
    { id: "burpees", ru: "Берпи", en: "Burpees" },
    { id: "running", ru: "Бег", en: "Running" },
    { id: "walking", ru: "Ходьба", en: "Walking" },
    { id: "cycling", ru: "Велосипед", en: "Cycling" },
    { id: "any", ru: "Любое упражнение", en: "Any exercise" },
  ];
  const difficultyLabels: Record<Difficulty, { ru: string; en: string }> = {
    EASY: { ru: "Лёгкий", en: "Easy" },
    MEDIUM: { ru: "Средний", en: "Medium" },
    HARD: { ru: "Сложный", en: "Hard" },
    ELITE: { ru: "Элита", en: "Elite" },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center px-4 py-8 bg-black/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="surface w-full max-w-lg p-6 sm:p-7 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 size-8 rounded-lg grid place-items-center text-ink-muted hover:text-ink hover:bg-white/[0.04]"
              aria-label="close"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="size-9 rounded-xl bg-lime/12 grid place-items-center border border-lime/30">
                <Plus className="size-4 text-lime" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {locale === "ru" ? "Новый челлендж" : "New challenge"}
              </h2>
            </div>
            <p className="text-sm text-ink-dim mb-5">
              {locale === "ru"
                ? "Личный челлендж. Только ты участвуешь — ставь цель и добивайся."
                : "Personal challenge. Just you — set a goal and crush it."}
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm text-rose">
                {error === "DEFAULT"
                  ? locale === "ru"
                    ? "Не удалось создать. Попробуй ещё раз."
                    : "Failed to create. Try again."
                  : error}
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-3">
              <Field
                label={locale === "ru" ? "Название" : "Title"}
                value={title}
                onChange={setTitle}
                placeholder={
                  locale === "ru"
                    ? "30 подтягиваний за 10 дней"
                    : "30 pull-ups in 10 days"
                }
                required
                maxLength={80}
              />

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-ink-dim">
                  {locale === "ru" ? "Описание (необязательно)" : "Description (optional)"}
                </span>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value.slice(0, 500))}
                  rows={2}
                  className="rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-lime/50 outline-none resize-none"
                  placeholder={
                    locale === "ru"
                      ? "Любые сеты, главное — суммарно достичь цели."
                      : "Any sets, just hit the total goal."
                  }
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-ink-dim">
                    {locale === "ru" ? "Метрика" : "Metric"}
                  </span>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as Metric)}
                    className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink focus:border-lime/50 outline-none"
                  >
                    {(Object.keys(metricLabels) as Metric[]).map((k) => (
                      <option key={k} value={k}>
                        {metricLabels[k][locale]}
                      </option>
                    ))}
                  </select>
                </label>
                {(metric === "REPS" ||
                  metric === "MINUTES" ||
                  metric === "KM") && (
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-ink-dim">
                      {locale === "ru" ? "Упражнение" : "Exercise"}
                    </span>
                    <select
                      value={exerciseId}
                      onChange={(e) => setExerciseId(e.target.value)}
                      className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink focus:border-lime/50 outline-none"
                    >
                      {exerciseOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o[locale]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <NumberField
                  label={locale === "ru" ? "Цель" : "Goal"}
                  value={goal}
                  onChange={setGoal}
                  min={1}
                  max={1_000_000}
                />
                <NumberField
                  label={locale === "ru" ? "Длительность (дни)" : "Duration (days)"}
                  value={days}
                  onChange={setDays}
                  min={1}
                  max={120}
                />
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-ink-dim">
                    {locale === "ru" ? "Сложность" : "Difficulty"}
                  </span>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink focus:border-lime/50 outline-none"
                  >
                    {(Object.keys(difficultyLabels) as Difficulty[]).map((d) => (
                      <option key={d} value={d}>
                        {difficultyLabels[d][locale]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  disabled={pending}
                >
                  {locale === "ru" ? "Отмена" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="md"
                  className="gap-2"
                  disabled={pending || !title.trim()}
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {locale === "ru" ? "Создать" : "Create"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-dim">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink placeholder:text-ink-muted/60 focus:border-lime/50 outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-dim">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        min={min}
        max={max}
        className="h-11 rounded-xl border border-line bg-white/[0.03] px-3.5 text-ink placeholder:text-ink-muted/60 focus:border-lime/50 outline-none number-tabular"
      />
    </label>
  );
}
