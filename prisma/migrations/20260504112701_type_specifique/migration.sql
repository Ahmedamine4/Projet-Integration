/*
  Warnings:

  - You are about to drop the column `type_projet` on the `projets` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeSpecifique" AS ENUM ('personnel', 'academique');

-- AlterTable
ALTER TABLE "experiences" ADD COLUMN     "type_specifique" "TypeSpecifique";

-- AlterTable
ALTER TABLE "projets" DROP COLUMN "type_projet";
