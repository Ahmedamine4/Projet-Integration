/*
  Warnings:

  - You are about to drop the column `admin_inst_utilisateur_id` on the `institutions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[institution_id]` on the table `administrations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `institution_id` to the `administrations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_admin_inst_utilisateur_id_fkey";

-- AlterTable
ALTER TABLE "administrations" ADD COLUMN     "institution_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "admin_inst_utilisateur_id";

-- CreateIndex
CREATE UNIQUE INDEX "administrations_institution_id_key" ON "administrations"("institution_id");

-- AddForeignKey
ALTER TABLE "administrations" ADD CONSTRAINT "administrations_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;
