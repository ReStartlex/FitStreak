"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Trophy, Target, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

/**
 * Bottom navigation visible only on mobile viewports for authenticated
 * users. Mirrors the four most-used routes. Hidden on auth/onboarding
 * screens to avoid awkward stacking with sticky CTAs.
 */
export function MobileTabBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { status } = useSession();

  if (status !== "authenticated") return null;

  // Pages where bottom nav is intrusive (auth flow, onboarding, etc.)
  const HIDDEN = [
    "/signin",
    "/signup",
    "/onboarding",
    "/verify-email",
    "/forgot-password",
  ];
  if (HIDDEN.some((p) => pathname?.startsWith(p))) return null;

  const tabs: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { href: "/dashboard", label: t.nav.dashboard, icon: Home },
    { href: "/challenges", label: t.nav.challenges, icon: Target },
    { href: "/leaderboard", label: t.nav.leaderboard, icon: Trophy },
    { href: "/profile", label: t.nav.profile, icon: UserRound },
  ];

  return (
    <>
      {/* Spacer so footer / page bottoms aren't hidden behind the bar.
          Only present when the bar is rendered → avoids dead space on
          unauthenticated landing pages. */}
      <div className="md:hidden" aria-hidden="true" style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg-card/90 backdrop-blur-2xl"
        style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
        aria-label="Primary"
      >
        <div className="grid grid-cols-4">
          {tabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition-colors",
                  active ? "text-lime" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    active &&
                      "drop-shadow-[0_0_6px_rgba(198,255,61,0.4)]",
                  )}
                />
                <span className="font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
