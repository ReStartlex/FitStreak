import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailClient } from "./client";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Подтверждение email",
  description: "Подтверди email, чтобы активировать аккаунт FitStreak.",
  path: "/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailClient />
    </Suspense>
  );
}
