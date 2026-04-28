import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailClient } from "./client";

export const metadata: Metadata = {
  title: "Confirm email — FitStreak",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailClient />
    </Suspense>
  );
}
