-- CreateTable
CREATE TABLE "repositories" (
    "repository_id" TEXT NOT NULL,
    "github_id" INTEGER NOT NULL,
    "etudiant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "github_access_token" TEXT,
    "last_synced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("repository_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repositories_github_id_key" ON "repositories"("github_id");

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_etudiant_id_fkey" FOREIGN KEY ("etudiant_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;
