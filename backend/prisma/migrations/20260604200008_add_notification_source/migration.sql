ALTER TABLE "notifications"
  ADD COLUMN "utilisateur_source_id" TEXT NULL;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_utilisateur_source_id_fkey"
  FOREIGN KEY ("utilisateur_source_id")
  REFERENCES "utilisateurs"("utilisateur_id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "notifications_utilisateur_source_id_idx"
  ON "notifications"("utilisateur_source_id");

CREATE INDEX "notifications_date_notification_idx"
  ON "notifications"("date_notification");