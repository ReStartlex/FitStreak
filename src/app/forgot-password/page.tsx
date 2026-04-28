import type { Metadata } from "next";
import { Suspense } from "react";

import { ForgotPasswordClient } from "./client";

export const metadata: Metadata = {
  title: "Forgot password — FitStreak",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
