-- CreateEnum
CREATE TYPE "StatutOffre" AS ENUM ('ACTIVE', 'TERMINEE');

-- AlterTable
ALTER TABLE "offres" ADD COLUMN     "statut" "StatutOffre" DEFAULT 'ACTIVE';
