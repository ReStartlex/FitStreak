export interface Achievement {
  id: string;
  emoji: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-workout",
    emoji: "🟢",
    titleRu: "Первый шаг",
    titleEn: "First step",
    descRu: "Первая активность отмечена",
    descEn: "First activity logged",
    unlocked: true,
    rarity: "common",
  },
  {
    id: "streak-7",
    emoji: "🔥",
    titleRu: "7 дней подряд",
    titleEn: "7-day streak",
    descRu: "Не пропустил неделю",
    descEn: "A week without skipping",
    unlocked: true,
    rarity: "common",
  },
  {
    id: "streak-14",
    emoji: "🔥",
    titleRu: "14 дней подряд",
    titleEn: "14-day streak",
    descRu: "Дисциплина железа",
    descEn: "Iron discipline",
    unlocked: true,
    rarity: "rare",
  },
  {
    id: "100-pushups",
    emoji: "💪",
    titleRu: "100 отжиманий",
    titleEn: "100 push-ups",
    descRu: "Суммарно за всё время",
    descEn: "Total all-time",
    unlocked: true,
    rarity: "common",
  },
  {
    id: "first-challenge",
    emoji: "🏁",
    titleRu: "Первый челлендж",
    titleEn: "First challenge",
    descRu: "Завершил первый вызов",
    descEn: "Completed your first one",
    unlocked: true,
    rarity: "common",
  },
  {
    id: "top-10",
    emoji: "🏆",
    titleRu: "Топ-10 дня",
    titleEn: "Top-10 of the day",
    descRu: "Зашёл в десятку лидеров",
    descEn: "Made it to daily top-10",
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "bar-king",
    emoji: "👑",
    titleRu: "Король турника",
    titleEn: "Bar king",
    descRu: "100 подтягиваний за неделю",
    descEn: "100 pull-ups in a week",
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "iron-discipline",
    emoji: "⚙️",
    titleRu: "Железная дисциплина",
    titleEn: "Iron discipline",
    descRu: "30 дней подряд",
    descEn: "30-day streak",
    unlocked: false,
    rarity: "legendary",
  },
];
