import * as React from "react";
import { cn } from "@/lib/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: number;
  ring?: boolean;
  tone?: "lime" | "violet" | "rose" | "cyan" | "default";
}

const toneRing: Record<NonNullable<AvatarProps["tone"]>, string> = {
  lime: "ring-2 ring-lime/60",
  violet: "ring-2 ring-violet/60",
  rose: "ring-2 ring-accent-rose/60",
  cyan: "ring-2 ring-accent-cyan/60",
  default: "ring-1 ring-line",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const palette = [
  "from-lime to-violet",
  "from-violet to-accent-rose",
  "from-accent-cyan to-lime",
  "from-accent-orange to-accent-rose",
  "from-accent-rose to-violet",
];

function hashIndex(s: string, len: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % len;
}

export function Avatar({
  src,
  name,
  size = 40,
  ring = true,
  tone = "default",
  className,
  ...props
}: AvatarProps) {
  const idx = hashIndex(name, palette.length);
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-bg-elevated text-ink select-none shrink-0",
        ring && toneRing[tone],
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "h-full w-full grid place-items-center bg-gradient-to-br text-bg font-bold",
            palette[idx],
          )}
          style={{ fontSize: Math.max(10, size * 0.38) }}
        >
          {initials(name)}
        </div>
      )}
    </div>
  );
}
