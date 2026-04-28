-- Add ChallengeType enum + Challenge metadata for user-created challenges.
-- Idempotent: safe to re-run.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ChallengeType') THEN
    CREATE TYPE "ChallengeType" AS ENUM ('PUBLIC', 'FRIENDS', 'PERSONAL');
  END IF;
END$$;

ALTER TABLE "Challenge"
  ADD COLUMN IF NOT EXISTS "type"        "ChallengeType" NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN IF NOT EXISTS "createdById" TEXT,
  ADD COLUMN IF NOT EXISTS "endsAt"      TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Challenge_type_idx"        ON "Challenge"("type");
CREATE INDEX IF NOT EXISTS "Challenge_createdById_idx" ON "Challenge"("createdById");
