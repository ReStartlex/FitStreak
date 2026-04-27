import { config } from "dotenv";
import pkg from "pg";
import { randomBytes } from "node:crypto";

config({ path: ".env" });

const { Client } = pkg;

const cuid = () => "c" + randomBytes(12).toString("hex");

const challenges = [
  { slug: "ch-100push-week", titleRu: "100 отжиманий за неделю", titleEn: "100 push-ups in a week", descRu: "Сделай 100 отжиманий за 7 дней. Можно любыми сетами.", descEn: "Do 100 push-ups in 7 days. Any sets — your choice.", metric: "REPS", exerciseId: "pushups", goal: 100, durationDays: 7, difficulty: "MEDIUM", rewardXp: 500, rewardEnergy: 250, isFeatured: true },
  { slug: "ch-30pull-10d", titleRu: "30 подтягиваний за 10 дней", titleEn: "30 pull-ups in 10 days", descRu: "Подтянись в темпе — короткие сеты каждый день.", descEn: "Stay in rhythm — short sets each day.", metric: "REPS", exerciseId: "pullups", goal: 30, durationDays: 10, difficulty: "HARD", rewardXp: 400, rewardEnergy: 200, isFeatured: true },
  { slug: "ch-14days-no-skip", titleRu: "14 дней без пропусков", titleEn: "14 days no skip", descRu: "Любая активность каждый день. Серия — главное.", descEn: "Any activity, every day. Streak first.", metric: "STREAK_DAYS", exerciseId: null, goal: 14, durationDays: 14, difficulty: "MEDIUM", rewardXp: 600, rewardEnergy: 300, isFeatured: true },
  { slug: "ch-300squat-week", titleRu: "300 приседаний за неделю", titleEn: "300 squats in a week", descRu: "Ноги в огне. Любые сеты, главное — суммарно 300.", descEn: "Legs on fire. Any sets, total 300.", metric: "REPS", exerciseId: "squats", goal: 300, durationDays: 7, difficulty: "HARD", rewardXp: 500, rewardEnergy: 250, isFeatured: false },
  { slug: "ch-5min-plank", titleRu: "5 минут планки в сумме", titleEn: "5 minutes of plank total", descRu: "Можно дробить по 30/60 секунд — лишь бы 5 минут вышло.", descEn: "Split into 30/60s — get 5 total minutes.", metric: "MINUTES", exerciseId: "plank", goal: 5, durationDays: 7, difficulty: "EASY", rewardXp: 200, rewardEnergy: 100, isFeatured: false },
  { slug: "ch-21day-discipline", titleRu: "21 день дисциплины", titleEn: "21 days of discipline", descRu: "Сезонная программа: ежедневный минимум активности.", descEn: "Seasonal program: daily minimum activity.", metric: "DAYS_ACTIVE", exerciseId: null, goal: 21, durationDays: 21, difficulty: "MEDIUM", rewardXp: 1000, rewardEnergy: 500, isFeatured: true },
  { slug: "ch-10k-energy-week", titleRu: "10 000 ES за неделю", titleEn: "10,000 ES in a week", descRu: "Любая активность — заработай 10 000 очков энергии за 7 дней.", descEn: "Any activity — bank 10,000 energy in 7 days.", metric: "ENERGY", exerciseId: null, goal: 10000, durationDays: 7, difficulty: "HARD", rewardXp: 800, rewardEnergy: 400, isFeatured: false },
  { slug: "ch-50km-month", titleRu: "50 км за месяц", titleEn: "50 km in a month", descRu: "Бег, ходьба, велосипед — любые километры идут в зачёт.", descEn: "Running, walking, cycling — every km counts.", metric: "KM", exerciseId: "running", goal: 50, durationDays: 30, difficulty: "MEDIUM", rewardXp: 700, rewardEnergy: 350, isFeatured: false },
];

const achievements = [
  { slug: "first-workout", icon: "🟢", titleRu: "Первый шаг", titleEn: "First step", descRu: "Первая активность отмечена", descEn: "First activity logged", tier: "BRONZE", rewardXp: 50 },
  { slug: "streak-7", icon: "🔥", titleRu: "7 дней подряд", titleEn: "7-day streak", descRu: "Неделя без пропусков", descEn: "A week without skipping", tier: "BRONZE", rewardXp: 150 },
  { slug: "streak-14", icon: "🔥", titleRu: "14 дней подряд", titleEn: "14-day streak", descRu: "Дисциплина железа", descEn: "Iron discipline", tier: "SILVER", rewardXp: 300 },
  { slug: "streak-30", icon: "⚙️", titleRu: "30 дней подряд", titleEn: "30-day streak", descRu: "Месяц без срывов", descEn: "A full month", tier: "GOLD", rewardXp: 700 },
  { slug: "streak-100", icon: "👑", titleRu: "100 дней подряд", titleEn: "100-day streak", descRu: "Стальная воля", descEn: "Steel will", tier: "LEGEND", rewardXp: 2500 },
  { slug: "100-pushups", icon: "💪", titleRu: "100 отжиманий", titleEn: "100 push-ups", descRu: "Суммарно за всё время", descEn: "Total all-time", tier: "BRONZE", rewardXp: 100 },
  { slug: "first-challenge", icon: "🏁", titleRu: "Первый челлендж", titleEn: "First challenge", descRu: "Завершил первый вызов", descEn: "Completed your first challenge", tier: "BRONZE", rewardXp: 100 },
  { slug: "top-10", icon: "🏆", titleRu: "Топ-10 дня", titleEn: "Top-10 of the day", descRu: "Зашёл в десятку лидеров", descEn: "Made it to daily top-10", tier: "GOLD", rewardXp: 500 },
  { slug: "bar-king", icon: "👑", titleRu: "Король турника", titleEn: "Bar king", descRu: "100 подтягиваний за неделю", descEn: "100 pull-ups in a week", tier: "ELITE", rewardXp: 750 },
  { slug: "10k-energy", icon: "⚡", titleRu: "10 000 ES", titleEn: "10,000 ES", descRu: "Накоплено 10 000 очков энергии", descEn: "10,000 lifetime energy", tier: "SILVER", rewardXp: 300 },
  { slug: "level-25", icon: "✨", titleRu: "25-й уровень", titleEn: "Level 25", descRu: "Достиг 25 уровня", descEn: "Reached level 25", tier: "SILVER", rewardXp: 250 },
  { slug: "level-50", icon: "🌟", titleRu: "50-й уровень", titleEn: "Level 50", descRu: "Достиг 50 уровня", descEn: "Reached level 50", tier: "GOLD", rewardXp: 800 },
  { slug: "marathon", icon: "🏃", titleRu: "Марафон", titleEn: "Marathon", descRu: "42 км за всё время", descEn: "42 km lifetime distance", tier: "GOLD", rewardXp: 600 },
];

const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
console.log("→ host:", new URL(url).host);

async function withRetry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      console.warn(`  retry ${i + 1}/${attempts}: ${e.message}`);
      if (i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function newClient() {
  const c = new Client({ connectionString: url });
  c.on("error", (err) => console.warn("  pg error event:", err.message));
  await c.connect();
  await c.query("SELECT 1");
  return c;
}

let c = await withRetry(newClient);

async function exec(sql, params) {
  return withRetry(async () => {
    try {
      return await c.query(sql, params);
    } catch (e) {
      console.warn("  reconnecting…");
      try { await c.end(); } catch {}
      c = await newClient();
      return c.query(sql, params);
    }
  });
}

console.log("🌱 Seeding challenges…");
for (const ch of challenges) {
  await exec(
    `INSERT INTO "Challenge" (id, slug, "titleRu", "titleEn", "descRu", "descEn", metric, "exerciseId", goal, "durationDays", difficulty, "rewardXp", "rewardEnergy", "isFeatured")
     VALUES ($1,$2,$3,$4,$5,$6,$7::"ChallengeMetric",$8,$9,$10,$11::"ChallengeDifficulty",$12,$13,$14)
     ON CONFLICT (slug) DO UPDATE SET
       "titleRu" = EXCLUDED."titleRu",
       "titleEn" = EXCLUDED."titleEn",
       "descRu"  = EXCLUDED."descRu",
       "descEn"  = EXCLUDED."descEn",
       metric    = EXCLUDED.metric,
       "exerciseId" = EXCLUDED."exerciseId",
       goal      = EXCLUDED.goal,
       "durationDays" = EXCLUDED."durationDays",
       difficulty = EXCLUDED.difficulty,
       "rewardXp" = EXCLUDED."rewardXp",
       "rewardEnergy" = EXCLUDED."rewardEnergy",
       "isFeatured" = EXCLUDED."isFeatured"`,
    [cuid(), ch.slug, ch.titleRu, ch.titleEn, ch.descRu, ch.descEn, ch.metric, ch.exerciseId, ch.goal, ch.durationDays, ch.difficulty, ch.rewardXp, ch.rewardEnergy, ch.isFeatured],
  );
}
console.log(`✓ ${challenges.length} challenges`);

console.log("🌱 Seeding achievements…");
for (const a of achievements) {
  await exec(
    `INSERT INTO "Achievement" (id, slug, icon, "titleRu", "titleEn", "descRu", "descEn", tier, "rewardXp")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::"AchievementTier",$9)
     ON CONFLICT (slug) DO UPDATE SET
       icon = EXCLUDED.icon,
       "titleRu" = EXCLUDED."titleRu",
       "titleEn" = EXCLUDED."titleEn",
       "descRu"  = EXCLUDED."descRu",
       "descEn"  = EXCLUDED."descEn",
       tier      = EXCLUDED.tier,
       "rewardXp" = EXCLUDED."rewardXp"`,
    [cuid(), a.slug, a.icon, a.titleRu, a.titleEn, a.descRu, a.descEn, a.tier, a.rewardXp],
  );
}
console.log(`✓ ${achievements.length} achievements`);

await c.end();
console.log("✅ Seed complete");
