export interface SmartReminder {
  id: string;
  emoji: string;
  textRu: string;
  textEn: string;
  tone: "lime" | "violet" | "rose" | "cyan";
}

export const SMART_REMINDERS: SmartReminder[] = [
  {
    id: "r-1",
    emoji: "🟢",
    textRu: "Ты уже 2 дня не отмечал активность. Начнём с +5 отжиманий?",
    textEn: "You haven't logged activity for 2 days. Let's start with +5 push-ups?",
    tone: "lime",
  },
  {
    id: "r-2",
    emoji: "🎯",
    textRu: "До дневной цели осталось 8 отжиманий. Один подход — и закрыто.",
    textEn: "8 push-ups to your daily goal. One set and it's done.",
    tone: "lime",
  },
  {
    id: "r-3",
    emoji: "⚔️",
    textRu: "Никита обошёл тебя в рейтинге. Ответишь?",
    textEn: "Nikita just passed you in the leaderboard. Going to reply?",
    tone: "violet",
  },
  {
    id: "r-4",
    emoji: "🔥",
    textRu: "Сегодня можно продлить серию: 17 → 18 дней.",
    textEn: "Today extends your streak: 17 → 18 days.",
    tone: "rose",
  },
  {
    id: "r-5",
    emoji: "🏁",
    textRu: "Завершай челлендж, осталось 12 повторений до 100.",
    textEn: "Finish the challenge — 12 reps left to hit 100.",
    tone: "cyan",
  },
];
