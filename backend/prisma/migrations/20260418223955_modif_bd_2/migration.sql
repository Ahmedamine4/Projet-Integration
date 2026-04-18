/*
  Warnings:

  - Added the required column `admin_inst_utilisateur_id` to the `institutions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "RoleUtilisateur" ADD VALUE 'administration';

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "admin_inst_utilisateur_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "administrations" (
    "admin_inst_utilisateur_id" INTEGER NOT NULL,
    "poste" VARCHAR(100),
    "bureau" VARCHAR(50),
    "telephone" VARCHAR(20),

    CONSTRAINT "administrations_pkey" PRIMARY KEY ("admin_inst_utilisateur_id")
);

-- AddForeignKey
ALTER TABLE "administrations" ADD CONSTRAINT "administrations_admin_inst_utilisateur_id_fkey" FOREIGN KEY ("admin_inst_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_admin_inst_utilisateur_id_fkey" FOREIGN KEY ("admin_inst_utilisateur_id") REFERENCES "administrations"("admin_inst_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;
