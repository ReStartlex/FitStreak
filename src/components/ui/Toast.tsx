"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number;
}

interface ToastContextValue {
  toast: (message: string, opts?: { tone?: ToastTone; durationMs?: number }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * Tiny app-wide toast system. Drop `<ToastProvider>` near the root and
 * use `useToast()` anywhere underneath.
 *
 * Implementation note: we deliberately avoid a heavy dep — three small
 * tones and an auto-timeout cover 95% of our cases.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const idRef = React.useRef(1);

  const dismiss = React.useCallback((id: number) => {
    setItems((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    (message, opts) => {
      const id = idRef.current++;
      const tone = opts?.tone ?? "info";
      const durationMs = opts?.durationMs ?? 3000;
      setItems((arr) => [...arr, { id, message, tone, durationMs }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 sm:bottom-6 z-[60] flex flex-col items-center gap-2 px-3"
        role="region"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "pointer-events-auto w-full max-w-sm flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-soft backdrop-blur-2xl",
                t.tone === "success" &&
                  "border-lime/40 bg-lime/12 text-ink",
                t.tone === "error" &&
                  "border-accent-rose/40 bg-accent-rose/12 text-ink",
                t.tone === "info" && "border-line bg-bg-card/90 text-ink",
              )}
            >
              <span className="mt-0.5 shrink-0">
                {t.tone === "success" ? (
                  <CheckCircle2 className="size-4 text-lime" />
                ) : t.tone === "error" ? (
                  <AlertTriangle className="size-4 text-accent-rose" />
                ) : (
                  <Info className="size-4 text-violet-soft" />
                )}
              </span>
              <span className="text-sm flex-1 break-words">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-ink-muted hover:text-ink transition-colors"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue["toast"] {
  const ctx = React.useContext(ToastContext);
  // Soft fallback so unwrapped callers don't crash; logs to console.
  if (!ctx) {
    return (message) => {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.warn("[toast: no provider]", message);
      }
    };
  }
  return ctx.toast;
}
