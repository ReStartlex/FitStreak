"use client";

import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

export function LocaleSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-bg-card/70 p-0.5 text-xs",
        className,
      )}
    >
      {(["ru", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "px-2.5 h-7 rounded-full transition-colors uppercase",
            locale === l
              ? "bg-white/[0.08] text-ink"
              : "text-ink-muted hover:text-ink-dim",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
