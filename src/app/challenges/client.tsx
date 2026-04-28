"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";
import {
  ApiChallengeCard,
  type ApiChallengeView,
} from "@/components/challenges/ApiChallengeCard";
import { CreateChallengeModal } from "@/components/challenges/CreateChallengeModal";

type Tab = "all" | "personal" | "friends" | "public" | "active";

interface Props {
  challenges: ApiChallengeView[];
  isAuthed: boolean;
}

export function ChallengesClient({ challenges, isAuthed }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("all");
  const [createOpen, setCreateOpen] = React.useState(false);

  const filtered = challenges.filter((c) => {
    if (tab === "all") return true;
    if (tab === "active") return c.joined;
    if (tab === "personal") return c.type === "PERSONAL";
    if (tab === "friends") return c.type === "FRIENDS";
    if (tab === "public") return c.type === "PUBLIC";
    return true;
  });

  const counts = {
    all: challenges.length,
    active: challenges.filter((c) => c.joined).length,
    personal: challenges.filter((c) => c.type === "PERSONAL").length,
    friends: challenges.filter((c) => c.type === "FRIENDS").length,
    public: challenges.filter((c) => c.type === "PUBLIC").length,
  };

  const onCreateClick = () => {
    if (!isAuthed) {
      router.push("/signin?from=/challenges");
      return;
    }
    setCreateOpen(true);
  };

  return (
    <main className="container py-8 sm:py-12">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6 sm:mb-8">
        <div>
          <h1 className="font-display text-display-md sm:text-display-lg font-bold">
            {t.challenges.title}
          </h1>
          <p className="text-ink-dim mt-2 max-w-2xl">{t.challenges.subtitle}</p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2"
          onClick={onCreateClick}
        >
          <Plus className="size-4" />
          {t.challenges.created}
        </Button>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 mask-fade-r">
        <Tabs<Tab>
          items={[
            { id: "all", label: t.challenges.tabAll, count: counts.all },
            { id: "active", label: t.challenges.tabActive, count: counts.active },
            { id: "personal", label: t.challenges.tabPersonal, count: counts.personal },
            { id: "friends", label: t.challenges.tabFriends, count: counts.friends },
            { id: "public", label: t.challenges.tabPublic, count: counts.public },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="surface mt-6 p-10 text-center text-ink-dim">
          <div className="text-4xl mb-3">📭</div>
          {locale === "ru"
            ? "Пока пусто. Создай свой первый челлендж!"
            : "Nothing here yet. Create your first challenge!"}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {filtered.map((c, i) => (
            <ApiChallengeCard key={c.id} c={c} index={i} />
          ))}
        </div>
      )}

      <CreateChallengeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </main>
  );
}
