/*
  Warnings:

  - A unique constraint covering the columns `[supabase_uid]` on the table `utilisateurs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "provider" TEXT DEFAULT 'local',
ADD COLUMN     "supabase_uid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_supabase_uid_key" ON "utilisateurs"("supabase_uid");
