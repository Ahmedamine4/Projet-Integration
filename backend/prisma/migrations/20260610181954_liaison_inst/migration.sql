/*
  Warnings:

  - You are about to drop the column `date` on the `valide_etudiant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "etudiants" ADD COLUMN     "etudie" BOOLEAN;

-- AlterTable
ALTER TABLE "valide_etudiant" DROP COLUMN "date",
ADD COLUMN     "date_debut" TIMESTAMP(3),
ADD COLUMN     "date_fin" TIMESTAMP(3);
