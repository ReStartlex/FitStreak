"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";

type Gender = "MALE" | "FEMALE" | "OTHER";
type FitnessLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ATHLETE";
type Goal = "HEALTH" | "WEIGHT_LOSS" | "STAMINA" | "MUSCLE" | "COMPETITIVE";

interface InitialState {
  gender: Gender | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  fitnessLevel: FitnessLevel | null;
  goal: Goal | null;
}

export function OnboardingClient({ initial }: { initial: InitialState }) {
  const { t } = useI18n();
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [gender, setGender] = React.useState<Gender>(initial.gender ?? "MALE");
  const [age, setAge] = React.useState<number>(initial.age ?? 25);
  const [heightCm, setHeightCm] = React.useState<number>(initial.heightCm ?? 175);
  const [weightKg, setWeightKg] = React.useState<number>(initial.weightKg ?? 75);
  const [fitnessLevel, setFitnessLevel] = React.useState<FitnessLevel>(
    initial.fitnessLevel ?? "INTERMEDIATE",
  );
  const [goal, setGoal] = React.useState<Goal>(initial.goal ?? "HEALTH");

  const onFinish = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/me/body", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gender,
          age,
          heightCm,
          weightKg,
          fitnessLevel,
          goal,
          onboardingComplete: true,
        }),
      });
      if (!res.ok) {
        setError(t.auth.saveError);
        setPending(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.auth.saveError);
      setPending(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="container py-5 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <LocaleSwitch />
      </header>

      <main className="flex-1 grid place-items-center px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-6">
            <span className="chip">
              {t.onboarding.step} {step} {t.onboarding.of} 3
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-3">
              {t.onboarding.title}
            </h1>
            <p className="text-ink-dim mt-2 text-sm">{t.onboarding.subtitle}</p>
          </div>

          <div className="surface p-6 sm:p-8">
            <ProgressTrack step={step} total={3} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="mt-6"
                >
                  <h2 className="font-display text-xl font-semibold">
                    {t.onboarding.step1Title}
                  </h2>
                  <p className="text-ink-dim text-sm mt-1">
                    {t.onboarding.step1Subtitle}
                  </p>

                  <div className="mt-5">
                    <Label>{t.bodyMetrics.gender}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Choice
                        active={gender === "MALE"}
                        onClick={() => setGender("MALE")}
                      >
                        {t.bodyMetrics.male}
                      </Choice>
                      <Choice
                        active={gender === "FEMALE"}
                        onClick={() => setGender("FEMALE")}
                      >
                        {t.bodyMetrics.female}
                      </Choice>
                      <Choice
                        active={gender === "OTHER"}
                        onClick={() => setGender("OTHER")}
                      >
                        {t.bodyMetrics.other}
                      </Choice>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Label>
                      {t.bodyMetrics.age}{" "}
                      <span className="text-ink-muted">{t.bodyMetrics.ageUnit}</span>
                    </Label>
                    <NumberInput
                      value={age}
                      onChange={setAge}
                      min={13}
                      max={99}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="mt-6"
                >
                  <h2 className="font-display text-xl font-semibold">
                    {t.onboarding.step2Title}
                  </h2>
                  <p className="text-ink-dim text-sm mt-1">
                    {t.onboarding.step2Subtitle}
                  </p>

                  <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>
                        {t.bodyMetrics.height}{" "}
                        <span className="text-ink-muted">
                          {t.bodyMetrics.heightUnit}
                        </span>
                      </Label>
                      <NumberInput
                        value={heightCm}
                        onChange={setHeightCm}
                        min={120}
                        max={230}
                      />
                    </div>
                    <div>
                      <Label>
                        {t.bodyMetrics.weight}{" "}
                        <span className="text-ink-muted">
                          {t.bodyMetrics.weightUnit}
                        </span>
                      </Label>
                      <NumberInput
                        value={weightKg}
                        onChange={setWeightKg}
                        min={35}
                        max={220}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-ink-muted">
                    {t.bodyMetrics.privacyHint}
                  </p>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="mt-6"
                >
                  <h2 className="font-display text-xl font-semibold">
                    {t.onboarding.step3Title}
                  </h2>
                  <p className="text-ink-dim text-sm mt-1">
                    {t.onboarding.step3Subtitle}
                  </p>

                  <div className="mt-5">
                    <Label>{t.bodyMetrics.fitnessLevel}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          ["BEGINNER", t.bodyMetrics.beginner],
                          ["INTERMEDIATE", t.bodyMetrics.intermediate],
                          ["ADVANCED", t.bodyMetrics.advanced],
                          ["ATHLETE", "Athlete"],
                        ] as const
                      ).map(([id, label]) => (
                        <Choice
                          key={id}
                          active={fitnessLevel === id}
                          onClick={() => setFitnessLevel(id as FitnessLevel)}
                        >
                          {label}
                        </Choice>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <Label>{t.bodyMetrics.goal}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Choice active={goal === "HEALTH"} onClick={() => setGoal("HEALTH")}>
                        {t.bodyMetrics.goalHabit}
                      </Choice>
                      <Choice
                        active={goal === "WEIGHT_LOSS"}
                        onClick={() => setGoal("WEIGHT_LOSS")}
                      >
                        {t.bodyMetrics.goalLose}
                      </Choice>
                      <Choice
                        active={goal === "STAMINA"}
                        onClick={() => setGoal("STAMINA")}
                      >
                        {t.bodyMetrics.goalEndurance}
                      </Choice>
                      <Choice
                        active={goal === "MUSCLE"}
                        onClick={() => setGoal("MUSCLE")}
                      >
                        {t.bodyMetrics.goalStrength}
                      </Choice>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mt-4 text-sm text-rose">{error}</div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || pending}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                {t.onboarding.back}
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  className="gap-2"
                >
                  {t.onboarding.next}
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={onFinish} disabled={pending} className="gap-2">
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {t.onboarding.finish}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function ProgressTrack({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < step ? "bg-lime" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-ink-dim mb-2">{children}</div>;
}

function Choice({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 rounded-xl border px-3 text-sm font-medium transition ${
        active
          ? "border-lime/60 bg-lime/10 text-lime"
          : "border-line hover:border-line-strong"
      }`}
    >
      {children}
    </button>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-11 w-11 rounded-xl border border-line text-lg hover:border-line-strong"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        className="h-11 flex-1 rounded-xl border border-line bg-white/[0.03] px-3.5 text-center text-lg font-semibold text-ink focus:border-lime/50 outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-11 w-11 rounded-xl border border-line text-lg hover:border-line-strong"
      >
        +
      </button>
    </div>
  );
}
