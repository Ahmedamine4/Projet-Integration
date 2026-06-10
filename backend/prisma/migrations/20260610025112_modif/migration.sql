/*
  Warnings:

  - You are about to drop the column `action` on the `connexions` table. All the data in the column will be lost.
  - You are about to drop the column `date_action` on the `connexions` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `interactions` table. All the data in the column will be lost.
  - You are about to drop the `valide_certification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[session_token]` on the table `connexions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `connexions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_token` to the `connexions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "valide_certification" DROP CONSTRAINT "valide_certification_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_certification" DROP CONSTRAINT "valide_certification_institution_id_fkey";

-- AlterTable
ALTER TABLE "certifications" ADD COLUMN     "institution_id" TEXT;

-- AlterTable
ALTER TABLE "connexions"
ADD COLUMN     "date_connexion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "session_token" TEXT;

-- Backfill restored sessions before enforcing required fields.
UPDATE "connexions"
SET
    "session_token" = COALESCE("session_token", 'restored-' || "connexion_id"),
    "expires_at" = COALESCE(
        "expires_at",
        COALESCE("date_action", "date_de_connexion", CURRENT_TIMESTAMP) + INTERVAL '30 days'
    );

ALTER TABLE "connexions"
ALTER COLUMN "expires_at" SET NOT NULL,
ALTER COLUMN "session_token" SET NOT NULL,
DROP COLUMN "action",
DROP COLUMN "date_action";

-- AlterTable
ALTER TABLE "experiences" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "academique" BOOLEAN;

-- AlterTable
ALTER TABLE "interactions" DROP COLUMN "statut",
ADD COLUMN     "visibilite" BOOLEAN NOT NULL DEFAULT false;

-- Preserve certification/institution links before dropping the old validation table.
UPDATE "certifications" AS c
SET "institution_id" = vc."institution_id"
FROM "valide_certification" AS vc
WHERE c."experience_id" = vc."experience_id";

-- DropTable
DROP TABLE "valide_certification";

-- CreateTable
CREATE TABLE "portfolio_score_history" (
    "history_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "breakdown" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_score_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "connexions_session_token_key" ON "connexions"("session_token");

-- AddForeignKey
ALTER TABLE "portfolio_score_history" ADD CONSTRAINT "portfolio_score_history_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("portfolio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE SET NULL ON UPDATE CASCADE;
