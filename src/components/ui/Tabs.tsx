"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  count?: number;
}

interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
  size = "md",
}: TabsProps<T>) {
  const layoutId = React.useId();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border border-line bg-bg-card/70 p-1 backdrop-blur-xl",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-xl font-medium transition-colors",
              size === "sm" ? "px-3 h-8 text-xs" : "px-4 h-10 text-sm",
              active ? "text-bg" : "text-ink-dim hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-lime-gradient shadow-glow"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "relative z-10 rounded-full px-1.5 py-0.5 text-[10px] number-tabular",
                  active
                    ? "bg-bg/20 text-bg"
                    : "bg-white/[0.06] text-ink-dim",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
