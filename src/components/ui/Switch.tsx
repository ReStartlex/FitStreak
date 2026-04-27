"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  className,
  id,
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        className,
      )}
    >
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full border transition-colors",
          checked
            ? "bg-lime-gradient border-lime/40 shadow-glow"
            : "bg-white/[0.08] border-line",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-bg shadow-sm transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
      <input id={id} type="checkbox" className="sr-only" checked={checked} readOnly />
    </label>
  );
}
