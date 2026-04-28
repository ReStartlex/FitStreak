"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { EXERCISES, exerciseUnitLabel } from "@/lib/mock/exercises";
import { calcEnergyScore, calcXP } from "@/lib/scoring";
import { cn } from "@/lib/cn";
import { useQuickLogHistory } from "@/lib/hooks/use-quick-log-history";

interface QuickLogProps {
  onAdd: (
    exerciseId: string,
    amount: number,
    energy: number,
    xp: number,
  ) => void | Promise<void>;
  disabled?: boolean;
}

interface Pulse {
  id: number;
  amount: number;
  unit: string;
  energy: number;
  xp: number;
  error?: boolean;
}

export function QuickLog({ onAdd, disabled }: QuickLogProps) {
  const { t, locale } = useI18n();
  const [pulses, setPulses] = React.useState<Pulse[]>([]);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const { top: favourites, record: recordFavourite } = useQuickLogHistory();

  async function handleAdd(exId: string, amount: number, unit: string) {
    if (disabled || pendingId) return;
    const energy = calcEnergyScore(exId, amount);
    const xp = calcXP(exId, amount);
    setPendingId(exId);
    const id = Date.now() + Math.random();
    setPulses((p) => [...p, { id, amount, unit, energy, xp }]);
    try {
      await onAdd(exId, amount, energy, xp);
      // Only record on success — failed taps shouldn't pollute history.
      recordFavourite(exId, amount);
    } catch {
      setPulses((p) =>
        p.map((x) => (x.id === id ? { ...x, error: true } : x)),
      );
    }
    setPendingId(null);
    setTimeout(() => {
      setPulses((p) => p.filter((x) => x.id !== id));
    }, 1700);
  }

  return (
    <div className="surface p-5 sm:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-8 grid place-items-center rounded-xl bg-lime/15 border border-lime/30">
            <Sparkles className="size-4 text-lime" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              {t.dashboard.quickLog}
            </h3>
            <p className="text-xs text-ink-dim">{t.dashboard.quickLogSubtitle}</p>
          </div>
        </div>
      </div>

      {favourites.length >= 2 ? (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2 flex items-center gap-1.5">
            <Star className="size-3 text-accent-orange" />
            {locale === "ru" ? "Часто" : "Frequent"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {favourites.map((f) => {
              const ex = EXERCISES.find((e) => e.id === f.exerciseId);
              if (!ex) return null;
              const Icon = ex.icon;
              const unit = exerciseUnitLabel(ex, locale);
              return (
                <motion.button
                  key={`${f.exerciseId}:${f.amount}`}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleAdd(ex.id, f.amount, unit)}
                  disabled={disabled || pendingId === ex.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  <Icon className="size-3.5 text-ink-muted" />
                  <span className="font-medium">+{f.amount}</span>
                  <span className="text-ink-dim">{unit}</span>
                  <span className="opacity-50">·</span>
                  <span className="text-ink-dim truncate max-w-[80px]">
                    {locale === "ru" ? ex.nameRu : ex.nameEn}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {EXERCISES.slice(0, 8).map((ex) => {
          const Icon = ex.icon;
          const unitLabel = exerciseUnitLabel(ex, locale);
          const tone = {
            lime: "from-lime/20 to-transparent border-lime/25 text-lime",
            violet: "from-violet/20 to-transparent border-violet/25 text-violet-soft",
            rose: "from-accent-rose/20 to-transparent border-accent-rose/25 text-accent-rose",
            cyan: "from-accent-cyan/20 to-transparent border-accent-cyan/25 text-accent-cyan",
            orange: "from-accent-orange/20 to-transparent border-accent-orange/25 text-accent-orange",
          }[ex.tone];

          return (
            <div
              key={ex.id}
              className="group rounded-2xl border border-line bg-white/[0.02] p-3 sm:p-4 transition-colors hover:border-line-strong"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "size-9 grid place-items-center rounded-xl border bg-gradient-to-br",
                  tone,
                )}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {locale === "ru" ? ex.nameRu : ex.nameEn}
                  </div>
                  <div className="text-[10px] text-ink-muted mt-0.5 number-tabular">
                    {ex.energyPerUnit * (ex.unit === "seconds" ? 60 : 1) === ex.energyPerUnit * (ex.unit === "seconds" ? 60 : 1) && (
                      <span>
                        {ex.unit === "km"
                          ? `1 ${unitLabel} = ${ex.energyPerUnit} ES · ${ex.xpPerUnit} XP`
                          : ex.unit === "seconds"
                            ? `1 ${locale === "ru" ? "мин" : "min"} = ${Math.round(ex.energyPerUnit * 60)} ES · ${Math.round(ex.xpPerUnit * 60)} XP`
                            : `10 ${unitLabel} = ${Math.round(ex.energyPerUnit * 10 * 10) / 10} ES · ${Math.round(ex.xpPerUnit * 10)} XP`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ex.quickAdds.map((q) => (
                  <motion.button
                    key={q}
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ y: -2 }}
                    onClick={() => handleAdd(ex.id, q, unitLabel)}
                    disabled={disabled || pendingId === ex.id}
                    className="rounded-xl border border-line bg-bg-elevated/60 hover:bg-white/[0.08] hover:border-line-strong px-2 py-2.5 text-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="font-display font-bold text-sm number-tabular">
                      +{q}
                    </span>
                    <span className="block text-[10px] text-ink-muted">
                      {unitLabel}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-1.5">
        <AnimatePresence>
          {pulses.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14, scale: 0.92 }}
              animate={{ opacity: 1, y: -8, scale: 1 }}
              exit={{ opacity: 0, y: -36, scale: 0.95 }}
              transition={{ duration: 0.65 }}
              className="flex items-center gap-2"
            >
              <span className={cn(
                "rounded-full font-display font-bold text-sm px-4 py-1.5 shadow-glow",
                p.error
                  ? "bg-rose text-white"
                  : "bg-lime-gradient text-bg",
              )}>
                {p.error ? `! ${p.amount} ${p.unit}` : `+${p.amount} ${p.unit}`}
              </span>
              {!p.error && (
                <>
                  <span className="rounded-full border border-lime/40 bg-lime/15 text-lime font-display font-semibold text-xs px-3 py-1.5">
                    +{p.energy} ES
                  </span>
                  <span className="rounded-full border border-violet/40 bg-violet/15 text-violet-soft font-display font-semibold text-xs px-3 py-1.5">
                    +{p.xp} XP
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
