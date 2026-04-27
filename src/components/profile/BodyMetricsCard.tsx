"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Loader2,
  Pencil,
  Ruler,
  Scale,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/provider";

export type DBGender = "MALE" | "FEMALE" | "OTHER";
export type DBFitnessLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ATHLETE";
export type DBGoal = "HEALTH" | "WEIGHT_LOSS" | "STAMINA" | "MUSCLE" | "COMPETITIVE";

export interface BodyMetricsValue {
  gender: DBGender | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  fitnessLevel: DBFitnessLevel | null;
  goal: DBGoal | null;
}

const GENDERS: DBGender[] = ["MALE", "FEMALE", "OTHER"];
const FITNESS_LEVELS: DBFitnessLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "ATHLETE",
];
const GOALS: DBGoal[] = [
  "HEALTH",
  "WEIGHT_LOSS",
  "STAMINA",
  "MUSCLE",
  "COMPETITIVE",
];

export function BodyMetricsCard({ initial }: { initial: BodyMetricsValue }) {
  const { t } = useI18n();
  const router = useRouter();

  const [editing, setEditing] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<BodyMetricsValue>(initial);

  const value = draft;

  const goalLabel = (g: DBGoal) => {
    switch (g) {
      case "WEIGHT_LOSS":
        return t.bodyMetrics.goalLose;
      case "HEALTH":
        return t.bodyMetrics.goalHabit;
      case "MUSCLE":
        return t.bodyMetrics.goalStrength;
      case "STAMINA":
        return t.bodyMetrics.goalEndurance;
      case "COMPETITIVE":
        return t.bodyMetrics.goalFit;
    }
  };

  const fitnessLabel = (f: DBFitnessLevel) => {
    switch (f) {
      case "BEGINNER":
        return t.bodyMetrics.beginner;
      case "INTERMEDIATE":
        return t.bodyMetrics.intermediate;
      case "ADVANCED":
        return t.bodyMetrics.advanced;
      case "ATHLETE":
        return "Athlete";
    }
  };

  const genderLabel = (g: DBGender | null) => {
    switch (g) {
      case "MALE":
        return t.bodyMetrics.male;
      case "FEMALE":
        return t.bodyMetrics.female;
      case "OTHER":
        return t.bodyMetrics.other;
      default:
        return "—";
    }
  };

  const onSave = async () => {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/me/body", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        setError(t.auth.saveError);
        setPending(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError(t.auth.saveError);
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface p-6 relative overflow-hidden"
    >
      <div className="absolute -right-10 -top-10 size-72 rounded-full bg-violet/10 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              {t.bodyMetrics.title}
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">{t.bodyMetrics.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(initial);
                    setEditing(false);
                    setError(null);
                  }}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/[0.03] hover:bg-white/[0.07] px-3 py-1.5 text-xs text-ink-dim"
                >
                  <X className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-lime/40 bg-lime/15 hover:bg-lime/25 px-3 py-1.5 text-xs text-lime"
                >
                  {pending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  {pending ? t.auth.saving : t.reminders.save}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/[0.03] hover:bg-white/[0.07] hover:border-line-strong px-3 py-1.5 text-xs text-ink-dim transition-colors"
              >
                <Pencil className="size-3.5" />
                {t.bodyMetrics.edit}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-rose">{error}</div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricField icon={Users} label={t.bodyMetrics.gender}>
            {editing ? (
              <select
                className="w-full bg-bg-elevated/60 border border-line rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-lime/60"
                value={value.gender ?? "MALE"}
                onChange={(e) =>
                  setDraft({ ...draft, gender: e.target.value as DBGender })
                }
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {genderLabel(g)}
                  </option>
                ))}
              </select>
            ) : (
              <FieldValue>{genderLabel(value.gender)}</FieldValue>
            )}
          </MetricField>
          <MetricField icon={Calendar} label={t.bodyMetrics.age}>
            {editing ? (
              <input
                type="number"
                min={13}
                max={99}
                className="w-full bg-bg-elevated/60 border border-line rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-lime/60"
                value={value.age ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, age: Number(e.target.value) || null })
                }
              />
            ) : (
              <FieldValue>
                {value.age ?? "—"}{" "}
                <span className="text-ink-muted text-xs">{t.bodyMetrics.ageUnit}</span>
              </FieldValue>
            )}
          </MetricField>
          <MetricField icon={Ruler} label={t.bodyMetrics.height}>
            {editing ? (
              <input
                type="number"
                min={120}
                max={230}
                className="w-full bg-bg-elevated/60 border border-line rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-lime/60"
                value={value.heightCm ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, heightCm: Number(e.target.value) || null })
                }
              />
            ) : (
              <FieldValue>
                {value.heightCm ?? "—"}{" "}
                <span className="text-ink-muted text-xs">{t.bodyMetrics.heightUnit}</span>
              </FieldValue>
            )}
          </MetricField>
          <MetricField icon={Scale} label={t.bodyMetrics.weight}>
            {editing ? (
              <input
                type="number"
                min={35}
                max={220}
                className="w-full bg-bg-elevated/60 border border-line rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-lime/60"
                value={value.weightKg ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, weightKg: Number(e.target.value) || null })
                }
              />
            ) : (
              <FieldValue>
                {value.weightKg ?? "—"}{" "}
                <span className="text-ink-muted text-xs">{t.bodyMetrics.weightUnit}</span>
              </FieldValue>
            )}
          </MetricField>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-muted mb-2">
              <Sparkles className="size-3.5 text-violet-soft" />
              {t.bodyMetrics.fitnessLevel}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FITNESS_LEVELS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => editing && setDraft({ ...draft, fitnessLevel: f })}
                  disabled={!editing}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    value.fitnessLevel === f
                      ? "border-violet/60 bg-violet/15 text-violet-soft"
                      : "border-line bg-white/[0.02] text-ink-dim hover:border-line-strong",
                    !editing && value.fitnessLevel !== f && "opacity-60",
                  )}
                >
                  {fitnessLabel(f)}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-muted mb-2">
              <Target className="size-3.5 text-lime" />
              {t.bodyMetrics.goal}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => editing && setDraft({ ...draft, goal: g })}
                  disabled={!editing}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    value.goal === g
                      ? "border-lime/60 bg-lime/15 text-lime"
                      : "border-line bg-white/[0.02] text-ink-dim hover:border-line-strong",
                    !editing && value.goal !== g && "opacity-60",
                  )}
                >
                  {goalLabel(g)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          {t.bodyMetrics.privacyHint}
        </p>
      </div>
    </motion.div>
  );
}

function MetricField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-muted mb-1.5">
        <Icon className="size-3 text-ink-dim" />
        {label}
      </div>
      {children}
    </div>
  );
}

function FieldValue({ children }: { children: React.ReactNode }) {
  return <div className="font-display text-lg font-semibold number-tabular">{children}</div>;
}
