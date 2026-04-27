import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { enabledProvidersList } from "@/lib/auth/providers";

export const metadata: Metadata = {
  title: "Sign up — FitStreak",
};

export default function SignUpPage() {
  const providers = enabledProvidersList();
  return (
    <AuthShell
      mode="signup"
      enabledProviders={{
        google: providers.google,
        yandex: providers.yandex,
        vk: providers.vk,
      }}
    />
  );
}
