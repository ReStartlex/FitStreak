"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LocaleSwitch } from "./LocaleSwitch";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/cn";

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/challenges", label: t.nav.challenges },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/pricing", label: t.nav.pricing },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-2xl bg-bg/80 border-b border-line"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="FitStreak home">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 h-9 inline-flex items-center rounded-xl text-sm transition-colors",
                  active
                    ? "bg-white/[0.06] text-ink"
                    : "text-ink-dim hover:text-ink hover:bg-white/[0.04]",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LocaleSwitch />
          <Link href="/signin">
            <Button variant="ghost" size="sm">
              {t.nav.signin}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="gap-1.5">
              {t.nav.signup}
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden grid place-items-center size-10 rounded-xl border border-line bg-bg-card/70"
          aria-label="Open menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-bg/95 backdrop-blur-2xl">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 h-11 inline-flex items-center rounded-xl text-sm text-ink-dim hover:bg-white/[0.04] hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between mt-3 gap-2">
              <LocaleSwitch />
              <div className="flex items-center gap-2">
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    {t.nav.signin}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">{t.nav.signup}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
