/*
  Warnings:

  - You are about to drop the column `date_de_connexion` on the `connexions` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `connexions` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `connexions` table. All the data in the column will be lost.
  - Added the required column `action` to the `connexions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionSession" AS ENUM ('LOGIN', 'LOGOUT');

-- AlterTable
ALTER TABLE "connexions" DROP COLUMN "date_de_connexion",
DROP COLUMN "ip_address",
DROP COLUMN "statut",
ADD COLUMN     "action" "ActionSession" NOT NULL,
ADD COLUMN     "date_action" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "pays" TEXT,
ADD COLUMN     "ville" TEXT;
