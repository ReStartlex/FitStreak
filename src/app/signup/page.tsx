import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { enabledProvidersList } from "@/lib/auth/providers";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Регистрация в FitStreak — старт серии бесплатно",
  description:
    "Создай аккаунт FitStreak за 30 секунд. Серия дней, бесплатные челленджи и сообщество — без скрытых платежей.",
  path: "/signup",
  keywords: [
    "fitstreak регистрация",
    "fitstreak signup",
    "fitness app sign up",
    "free habit tracker",
    "create fitness account",
  ],
});

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
