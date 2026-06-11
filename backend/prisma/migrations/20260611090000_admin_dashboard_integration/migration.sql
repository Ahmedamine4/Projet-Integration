-- Admin dashboard integration:
-- - bloque replaces the removed delete-user workflow with block/unblock support.
-- - date_deconnexion preserves logout history instead of deleting connexion rows.
ALTER TABLE "utilisateurs" ADD COLUMN "bloque" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "connexions" ADD COLUMN "date_deconnexion" TIMESTAMP(3);
