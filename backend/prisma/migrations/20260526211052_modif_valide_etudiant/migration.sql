/*
  Warnings:

  - You are about to drop the column `date_d_action` on the `valide_etudiant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "github" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "x" TEXT;

-- AlterTable
ALTER TABLE "valide_etudiant" DROP COLUMN "date_d_action",
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "niveau" TEXT;
