-- 002: Add streak-freeze fields on User and per-user Achievement counter.
-- Idempotent: safe to re-run.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "streakFreezes"      INTEGER  NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "freezesEarnedTotal" INTEGER  NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "lastFreezeUsedAt"   TIMESTAMP(3);

ALTER TABLE "UserAchievement"
  ADD COLUMN IF NOT EXISTS "count"        INTEGER  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "lastEarnedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
