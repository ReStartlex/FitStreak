"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { CHALLENGES } from "@/lib/mock/challenges";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";

type Tab = "all" | "personal" | "friends" | "public" | "active";

export default function ChallengesPage() {
  const { t } = useI18n();
  const [tab, setTab] = React.useState<Tab>("all");

  const filtered = CHALLENGES.filter((c) => {
    if (tab === "all") return true;
    if (tab === "active") return c.joined;
    return c.type === tab;
  });

  return (
    <>
      <Header />
      <main className="container py-8 sm:py-12">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-display-md sm:text-display-lg font-bold">
              {t.challenges.title}
            </h1>
            <p className="text-ink-dim mt-2 max-w-2xl">{t.challenges.subtitle}</p>
          </div>
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="size-4" />
            {t.challenges.created}
          </Button>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 mask-fade-r">
          <Tabs<Tab>
            items={[
              { id: "all", label: t.challenges.tabAll, count: CHALLENGES.length },
              { id: "active", label: t.challenges.tabActive, count: CHALLENGES.filter((c) => c.joined).length },
              { id: "personal", label: t.challenges.tabPersonal, count: CHALLENGES.filter((c) => c.type === "personal").length },
              { id: "friends", label: t.challenges.tabFriends, count: CHALLENGES.filter((c) => c.type === "friends").length },
              { id: "public", label: t.challenges.tabPublic, count: CHALLENGES.filter((c) => c.type === "public").length },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {filtered.map((c, i) => (
            <ChallengeCard key={c.id} c={c} index={i} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
