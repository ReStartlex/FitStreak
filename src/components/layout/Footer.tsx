"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n/provider";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative border-t border-line bg-bg-soft/60 mt-20">
      <div className="container py-14 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4 max-w-sm">
            <Logo />
            <p className="text-sm text-ink-dim">{t.footer.description}</p>
            <p className="text-xs text-ink-muted mt-2">
              © {new Date().getFullYear()} FitStreak. {t.footer.rights}.
            </p>
          </div>

          <FooterCol title={t.footer.product}>
            <FooterLink href="/dashboard">{t.nav.dashboard}</FooterLink>
            <FooterLink href="/challenges">{t.nav.challenges}</FooterLink>
            <FooterLink href="/leaderboard">{t.nav.leaderboard}</FooterLink>
            <FooterLink href="/reminders">{t.nav.reminders}</FooterLink>
            <FooterLink href="/pricing">{t.nav.pricing}</FooterLink>
          </FooterCol>

          <FooterCol title={t.footer.company}>
            <FooterLink href="/about">{t.footer.about}</FooterLink>
            <FooterLink href="/blog">{t.footer.blog}</FooterLink>
            <FooterLink href="/careers">{t.footer.careers}</FooterLink>
            <FooterLink href="/contact">{t.footer.contact}</FooterLink>
          </FooterCol>

          <FooterCol title={t.footer.legal}>
            <FooterLink href="/privacy">{t.footer.privacy}</FooterLink>
            <FooterLink href="/terms">{t.footer.terms}</FooterLink>
          </FooterCol>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs uppercase tracking-widest text-ink-muted">
        {title}
      </h4>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="text-sm text-ink-dim hover:text-ink transition-colors">
        {children}
      </Link>
    </li>
  );
}
