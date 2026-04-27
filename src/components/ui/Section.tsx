import * as React from "react";
import { cn } from "@/lib/cn";

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  containerClassName?: string;
}

export function Section({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("relative py-20 sm:py-28", className)} {...props}>
      <div className={cn("container", containerClassName)}>
        {(eyebrow || title || subtitle) && (
          <header
            className={cn(
              "max-w-3xl mb-10 sm:mb-14 flex flex-col gap-3",
              align === "center" && "mx-auto text-center items-center",
            )}
          >
            {eyebrow && (
              <span className="chip self-start data-[align=center]:self-center"
                data-align={align}
              >
                <span className="size-1.5 rounded-full bg-lime animate-pulse-soft" />
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-display-md sm:text-display-lg text-balance">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base sm:text-lg text-ink-dim text-balance max-w-2xl">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
