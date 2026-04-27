import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { enabledProvidersList } from "@/lib/auth/providers";

export const metadata: Metadata = {
  title: "Sign in — FitStreak",
};

export default function SignInPage() {
  const providers = enabledProvidersList();
  return (
    <AuthShell
      mode="signin"
      enabledProviders={{
        google: providers.google,
        yandex: providers.yandex,
        vk: providers.vk,
      }}
    />
  );
}
