-- Projet:
-- on garde "photo", "technologies" et "domains" car ils sont utilisés
-- par le modèle final et par la logique Draft Project GitHub.
-- "type_projet" a déjà été supprimé par une migration précédente.

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
