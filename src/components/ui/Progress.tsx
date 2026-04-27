import * as React from "react";
import { cn } from "@/lib/cn";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  tone?: "lime" | "violet" | "rose" | "cyan";
  size?: "sm" | "md" | "lg";
}

const toneClass = {
  lime: "bg-lime-gradient",
  violet: "bg-violet-gradient",
  rose: "bg-gradient-to-r from-accent-rose to-violet",
  cyan: "bg-gradient-to-r from-accent-cyan to-violet",
} as const;

const sizeClass = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3",
} as const;

export function Progress({
  value,
  max = 100,
  tone = "lime",
  size = "md",
  className,
  ...props
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-white/[0.06] border border-line",
        sizeClass[size],
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          toneClass[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
