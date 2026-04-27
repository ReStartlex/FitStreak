"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { Locale } from "@/lib/i18n/dictionaries";

interface AnimatedNumberProps {
  value: number;
  locale?: Locale;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}

export function AnimatedNumber({
  value,
  locale = "ru",
  className,
  format,
}: AnimatedNumberProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 20, mass: 0.6 });
  const display = useTransform(spring, (v) => {
    const n = Math.round(v);
    return format
      ? format(n)
      : new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US").format(n);
  });

  React.useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
