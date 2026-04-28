"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

import { I18nProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * App-wide providers.
 *
 * `refetchOnWindowFocus` + a periodic refetch ensure the Header (which
 * relies on `useSession()`) flips from "Sign in" to the user menu the
 * moment the user comes back from an OAuth provider, even if the
 * landing page was statically cached at the edge.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus>
      <I18nProvider>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
