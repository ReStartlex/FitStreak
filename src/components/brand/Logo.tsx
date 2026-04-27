import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}

export function Logo({ className, size = 28, withWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="grid place-items-center rounded-xl bg-lime-gradient text-bg shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M14.5 2L4 14h7l-1.5 8L20 10h-7l1.5-8z"
            fill="currentColor"
          />
        </svg>
      </span>
      {withWordmark && (
        <span className="font-display text-base font-semibold tracking-tight">
          Fit<span className="text-gradient-lime">Streak</span>
        </span>
      )}
    </span>
  );
}
