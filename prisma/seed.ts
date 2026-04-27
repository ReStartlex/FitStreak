/**
 * Seed script for FitStreak.
 *
 * Run via `npm run db:seed` after `npm run db:push` / `npm run db:migrate`.
 * Idempotent: uses `upsert` based on `slug` so it can be re-run safely.
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const challenges = [
  {
    slug: "ch-100push-week",
    titleRu: "100 отжиманий за неделю",
    titleEn: "100 push-ups in a week",
    descRu: "Сделай 100 отжиманий за 7 дней. Можно любыми сетами.",
    descEn: "Do 100 push-ups in 7 days. Any sets — your choice.",
    metric: "REPS" as const,
    exerciseId: "pushups",
    goal: 100,
    durationDays: 7,
    difficulty: "MEDIUM" as const,
    rewardXp: 500,
    rewardEnergy: 250,
    isFeatured: true,
  },
  {
    slug: "ch-30pull-10d",
    titleRu: "30 подтягиваний за 10 дней",
    titleEn: "30 pull-ups in 10 days",
    descRu: "Подтянись в темпе — короткие сеты каждый день.",
    descEn: "Stay in rhythm — short sets each day.",
    metric: "REPS" as const,
    exerciseId: "pullups",
    goal: 30,
    durationDays: 10,
    difficulty: "HARD" as const,
    rewardXp: 400,
    rewardEnergy: 200,
    isFeatured: true,
  },
  {
    slug: "ch-14days-no-skip",
    titleRu: "14 дней без пропусков",
    titleEn: "14 days no skip",
    descRu: "Любая активность каждый день. Серия — главное.",
    descEn: "Any activity, every day. Streak first.",
    metric: "STREAK_DAYS" as const,
    exerciseId: null,
    goal: 14,
    durationDays: 14,
    difficulty: "MEDIUM" as const,
    rewardXp: 600,
    rewardEnergy: 300,
    isFeatured: true,
  },
  {
    slug: "ch-300squat-week",
    titleRu: "300 приседаний за неделю",
    titleEn: "300 squats in a week",
    descRu: "Ноги в огне. Любые сеты, главное — суммарно 300.",
    descEn: "Legs on fire. Any sets, total 300.",
    metric: "REPS" as const,
    exerciseId: "squats",
    goal: 300,
    durationDays: 7,
    difficulty: "HARD" as const,
    rewardXp: 500,
    rewardEnergy: 250,
    isFeatured: false,
  },
  {
    slug: "ch-5min-plank",
    titleRu: "5 минут планки в сумме",
    titleEn: "5 minutes of plank total",
    descRu: "Можно дробить по 30/60 секунд — лишь бы 5 минут вышло.",
    descEn: "Split into 30/60s — get 5 total minutes.",
    metric: "MINUTES" as const,
    exerciseId: "plank",
    goal: 5,
    durationDays: 7,
    difficulty: "EASY" as const,
    rewardXp: 200,
    rewardEnergy: 100,
    isFeatured: false,
  },
  {
    slug: "ch-21day-discipline",
    titleRu: "21 день дисциплины",
    titleEn: "21 days of discipline",
    descRu: "Сезонная программа: ежедневный минимум активности.",
    descEn: "Seasonal program: daily minimum activity.",
    metric: "DAYS_ACTIVE" as const,
    exerciseId: null,
    goal: 21,
    durationDays: 21,
    difficulty: "MEDIUM" as const,
    rewardXp: 1000,
    rewardEnergy: 500,
    isFeatured: true,
  },
  {
    slug: "ch-10k-energy-week",
    titleRu: "10 000 ES за неделю",
    titleEn: "10,000 ES in a week",
    descRu: "Любая активность — заработай 10 000 очков энергии за 7 дней.",
    descEn: "Any activity — bank 10,000 energy in 7 days.",
    metric: "ENERGY" as const,
    exerciseId: null,
    goal: 10_000,
    durationDays: 7,
    difficulty: "HARD" as const,
    rewardXp: 800,
    rewardEnergy: 400,
    isFeatured: false,
  },
  {
    slug: "ch-50km-month",
    titleRu: "50 км за месяц",
    titleEn: "50 km in a month",
    descRu: "Бег, ходьба, велосипед — любые километры идут в зачёт.",
    descEn: "Running, walking, cycling — every km counts.",
    metric: "KM" as const,
    exerciseId: "running",
    goal: 50,
    durationDays: 30,
    difficulty: "MEDIUM" as const,
    rewardXp: 700,
    rewardEnergy: 350,
    isFeatured: false,
  },
];

const achievements = [
  {
    slug: "first-workout",
    icon: "🟢",
    titleRu: "Первый шаг",
    titleEn: "First step",
    descRu: "Первая активность отмечена",
    descEn: "First activity logged",
    tier: "BRONZE" as const,
    rewardXp: 50,
  },
  {
    slug: "streak-7",
    icon: "🔥",
    titleRu: "7 дней подряд",
    titleEn: "7-day streak",
    descRu: "Неделя без пропусков",
    descEn: "A week without skipping",
    tier: "BRONZE" as const,
    rewardXp: 150,
  },
  {
    slug: "streak-14",
    icon: "🔥",
    titleRu: "14 дней подряд",
    titleEn: "14-day streak",
    descRu: "Дисциплина железа",
    descEn: "Iron discipline",
    tier: "SILVER" as const,
    rewardXp: 300,
  },
  {
    slug: "streak-30",
    icon: "⚙️",
    titleRu: "30 дней подряд",
    titleEn: "30-day streak",
    descRu: "Месяц без срывов",
    descEn: "A full month",
    tier: "GOLD" as const,
    rewardXp: 700,
  },
  {
    slug: "streak-100",
    icon: "👑",
    titleRu: "100 дней подряд",
    titleEn: "100-day streak",
    descRu: "Стальная воля",
    descEn: "Steel will",
    tier: "LEGEND" as const,
    rewardXp: 2500,
  },
  {
    slug: "100-pushups",
    icon: "💪",
    titleRu: "100 отжиманий",
    titleEn: "100 push-ups",
    descRu: "Суммарно за всё время",
    descEn: "Total all-time",
    tier: "BRONZE" as const,
    rewardXp: 100,
  },
  {
    slug: "first-challenge",
    icon: "🏁",
    titleRu: "Первый челлендж",
    titleEn: "First challenge",
    descRu: "Завершил первый вызов",
    descEn: "Completed your first challenge",
    tier: "BRONZE" as const,
    rewardXp: 100,
  },
  {
    slug: "top-10",
    icon: "🏆",
    titleRu: "Топ-10 дня",
    titleEn: "Top-10 of the day",
    descRu: "Зашёл в десятку лидеров",
    descEn: "Made it to daily top-10",
    tier: "GOLD" as const,
    rewardXp: 500,
  },
  {
    slug: "bar-king",
    icon: "👑",
    titleRu: "Король турника",
    titleEn: "Bar king",
    descRu: "100 подтягиваний за неделю",
    descEn: "100 pull-ups in a week",
    tier: "ELITE" as const,
    rewardXp: 750,
  },
  {
    slug: "10k-energy",
    icon: "⚡",
    titleRu: "10 000 ES",
    titleEn: "10,000 ES",
    descRu: "Накоплено 10 000 очков энергии",
    descEn: "10,000 lifetime energy",
    tier: "SILVER" as const,
    rewardXp: 300,
  },
  {
    slug: "level-25",
    icon: "✨",
    titleRu: "25-й уровень",
    titleEn: "Level 25",
    descRu: "Достиг 25 уровня",
    descEn: "Reached level 25",
    tier: "SILVER" as const,
    rewardXp: 250,
  },
  {
    slug: "level-50",
    icon: "🌟",
    titleRu: "50-й уровень",
    titleEn: "Level 50",
    descRu: "Достиг 50 уровня",
    descEn: "Reached level 50",
    tier: "GOLD" as const,
    rewardXp: 800,
  },
  {
    slug: "marathon",
    icon: "🏃",
    titleRu: "Марафон",
    titleEn: "Marathon",
    descRu: "42 км за всё время",
    descEn: "42 km lifetime distance",
    tier: "GOLD" as const,
    rewardXp: 600,
  },
];

async function main() {
  console.log("🌱 Seeding challenges…");
  for (const c of challenges) {
    await db.challenge.upsert({
      where: { slug: c.slug },
      create: c,
      update: {
        titleRu: c.titleRu,
        titleEn: c.titleEn,
        descRu: c.descRu,
        descEn: c.descEn,
        metric: c.metric,
        exerciseId: c.exerciseId,
        goal: c.goal,
        durationDays: c.durationDays,
        difficulty: c.difficulty,
        rewardXp: c.rewardXp,
        rewardEnergy: c.rewardEnergy,
        isFeatured: c.isFeatured,
      },
    });
  }
  console.log(`✓ ${challenges.length} challenges`);

  console.log("🌱 Seeding achievements…");
  for (const a of achievements) {
    await db.achievement.upsert({
      where: { slug: a.slug },
      create: a,
      update: a,
    });
  }
  console.log(`✓ ${achievements.length} achievements`);

  console.log("✅ Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
