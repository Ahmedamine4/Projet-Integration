/*
  Warnings:

  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_utilisateur_id_fkey";

-- DropTable
DROP TABLE "notifications";

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" TEXT NOT NULL,
    "message" TEXT,
    "date_notification" TIMESTAMP(3),
    "lu" BOOLEAN,
    "type" TEXT,
    "utilisateur_cible_id" TEXT NOT NULL,
    "utilisateur_source_id" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateur_cible_id_fkey" FOREIGN KEY ("utilisateur_cible_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateur_source_id_fkey" FOREIGN KEY ("utilisateur_source_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE SET NULL ON UPDATE CASCADE;
