import type { Metadata } from "next";
import { Suspense } from "react";

import { ForgotPasswordClient } from "./client";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Восстановление пароля",
  description: "Сбрось пароль FitStreak по email.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
