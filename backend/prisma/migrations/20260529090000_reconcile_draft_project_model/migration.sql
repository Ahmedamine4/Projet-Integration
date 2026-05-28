-- Reconcile the database with the Prisma schema and the Draft Project workflow.
-- This migration keeps the Repository shape used by the current services:
-- title / link / private, and restores the Projet draft fields used by GitHub import.

-- Repositories: normalize old GitHub-shaped columns to the current Repository model.
ALTER TABLE "repositories"
ADD COLUMN IF NOT EXISTS "title" TEXT,
ADD COLUMN IF NOT EXISTS "link" TEXT,
ADD COLUMN IF NOT EXISTS "private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "repositories"
SET
  "title" = COALESCE("title", "name", "full_name"),
  "link" = COALESCE("link", "html_url"),
  "private" = COALESCE("private", "is_private", false)
WHERE
  "title" IS NULL
  OR "link" IS NULL;

ALTER TABLE "repositories"
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "link" SET NOT NULL;

ALTER TABLE "repositories"
DROP COLUMN IF EXISTS "name",
DROP COLUMN IF EXISTS "full_name",
DROP COLUMN IF EXISTS "html_url",
DROP COLUMN IF EXISTS "is_private";

-- Projets: restore the fields used by Draft Project if they are missing.
ALTER TABLE "projets"
ADD COLUMN IF NOT EXISTS "repository_id" TEXT,
ADD COLUMN IF NOT EXISTS "photo" TEXT,
ADD COLUMN IF NOT EXISTS "is_draft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "technologies_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "technologies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "domains" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Keep one repository linked to at most one project, as assumed by the current draft logic.
CREATE UNIQUE INDEX IF NOT EXISTS "projets_repository_id_key"
ON "projets"("repository_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'projets_repository_id_fkey'
      AND table_name = 'projets'
  ) THEN
    ALTER TABLE "projets"
    ADD CONSTRAINT "projets_repository_id_fkey"
    FOREIGN KEY ("repository_id") REFERENCES "repositories"("repository_id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
