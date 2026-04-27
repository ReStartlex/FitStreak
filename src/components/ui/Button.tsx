"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 select-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        primary:
          "bg-lime-gradient text-bg shadow-glow hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(198,255,61,0.4),0_14px_70px_-10px_rgba(198,255,61,0.6)]",
        violet:
          "bg-violet-gradient text-white shadow-violet hover:brightness-110",
        secondary:
          "bg-white/[0.06] text-ink border border-line hover:bg-white/[0.1] hover:border-line-strong",
        ghost:
          "bg-transparent text-ink hover:bg-white/[0.06]",
        outline:
          "bg-transparent text-ink border border-line hover:border-line-strong hover:bg-white/[0.04]",
        danger:
          "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/20",
      },
      size: {
        sm: "h-9 rounded-xl px-3.5 text-sm",
        md: "h-11 rounded-xl px-5 text-sm",
        lg: "h-12 rounded-2xl px-6 text-base",
        xl: "h-14 rounded-2xl px-7 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
