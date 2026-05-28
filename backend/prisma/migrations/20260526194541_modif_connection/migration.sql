/*
  Warnings:

  - You are about to drop the column `device` on the `connexions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "connexions" DROP COLUMN "device",
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "browser_version" TEXT,
ADD COLUMN     "device_type" TEXT;
