import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { enabledProvidersList } from "@/lib/auth/providers";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Войти в FitStreak",
  description:
    "Вход в FitStreak через Google, Yandex, VK ID или email. Запусти серию ежедневной активности.",
  path: "/signin",
});

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
