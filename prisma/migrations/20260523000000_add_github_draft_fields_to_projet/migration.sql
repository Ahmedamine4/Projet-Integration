CREATE TABLE IF NOT EXISTS "repositories" (
  "repository_id" TEXT NOT NULL,
  "github_id" INTEGER NOT NULL,
  "etudiant_id" TEXT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "html_url" VARCHAR(255) NOT NULL,
  "language" VARCHAR(100),
  "stars" INTEGER NOT NULL DEFAULT 0,
  "forks" INTEGER NOT NULL DEFAULT 0,
  "is_private" BOOLEAN NOT NULL DEFAULT false,
  "github_access_token" TEXT,
  "last_synced" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "repositories_pkey" PRIMARY KEY ("repository_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "repositories_github_id_key"
ON "repositories"("github_id");

ALTER TABLE "repositories"
ADD CONSTRAINT "repositories_etudiant_id_fkey"
FOREIGN KEY ("etudiant_id") REFERENCES "etudiants"("etudiant_utilisateur_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "projets"
ADD COLUMN IF NOT EXISTS "repository_id" TEXT,
ADD COLUMN IF NOT EXISTS "is_draft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "technologies_locked" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "projets_repository_id_key"
ON "projets"("repository_id");

ALTER TABLE "projets"
ADD CONSTRAINT "projets_repository_id_fkey"
FOREIGN KEY ("repository_id") REFERENCES "repositories"("repository_id")
ON DELETE SET NULL ON UPDATE CASCADE;
