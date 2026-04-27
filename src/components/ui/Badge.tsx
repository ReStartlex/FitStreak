import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-line bg-white/[0.04] text-ink-dim",
        lime:
          "border-lime/40 bg-lime/15 text-lime",
        violet:
          "border-violet/40 bg-violet/15 text-violet-soft",
        success:
          "border-success/40 bg-success/15 text-success",
        danger:
          "border-danger/40 bg-danger/15 text-danger",
        outline:
          "border-line text-ink",
        solid:
          "border-transparent bg-lime text-bg",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
