/*
  Warnings:

  - The primary key for the `valide_etudiant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `valide_etudiant_id` was added to the `valide_etudiant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "valide_etudiant" DROP CONSTRAINT "valide_etudiant_pkey",
ADD COLUMN     "valide_etudiant_id" TEXT NOT NULL,
ADD CONSTRAINT "valide_etudiant_pkey" PRIMARY KEY ("valide_etudiant_id");

-- CreateIndex
CREATE INDEX "valide_etudiant_utilisateur_id_institution_id_idx" ON "valide_etudiant"("utilisateur_id", "institution_id");
