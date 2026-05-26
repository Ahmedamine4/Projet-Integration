-- Supprimer les colonnes orphelines de projets
ALTER TABLE "projets" DROP COLUMN IF EXISTS "domains";
ALTER TABLE "projets" DROP COLUMN IF EXISTS "technologies";
ALTER TABLE "projets" DROP COLUMN IF EXISTS "photo";
ALTER TABLE "projets" DROP COLUMN IF EXISTS "type_projet";

-- Ajouter date_fin dans stages
ALTER TABLE "stages" ADD COLUMN IF NOT EXISTS "date_fin" TIMESTAMP(3);

-- Modifier lettres_de_recommendations
ALTER TABLE "lettres_de_recommendations" 
  ADD COLUMN IF NOT EXISTS "objet" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ALTER COLUMN "statut" SET DEFAULT 'en_attente',
  ALTER COLUMN "date_lettre" SET DEFAULT now();

-- Supprimer type_candidature si plus dans le schema
ALTER TABLE "lettres_de_recommendations" DROP COLUMN IF EXISTS "type_candidature";