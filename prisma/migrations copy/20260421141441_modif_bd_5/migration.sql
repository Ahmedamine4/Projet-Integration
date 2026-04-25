/*
  Warnings:

  - Added the required column `type` to the `experiences` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeExperience" AS ENUM ('certification', 'projet', 'stage', 'activite');

-- AlterTable
ALTER TABLE "experiences" DROP COLUMN "type",
ADD COLUMN     "type" "TypeExperience" NOT NULL;
