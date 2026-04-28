"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

import { I18nProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
