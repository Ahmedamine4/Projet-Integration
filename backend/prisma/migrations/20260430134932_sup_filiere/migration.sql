/*
  Warnings:

  - You are about to drop the `_EtudiantToFiliere` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FiliereToInstitution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FiliereToProfesseur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `filieres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `validation_certification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `validation_du_projet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `validation_stage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EtudiantToFiliere" DROP CONSTRAINT "_EtudiantToFiliere_A_fkey";

-- DropForeignKey
ALTER TABLE "_EtudiantToFiliere" DROP CONSTRAINT "_EtudiantToFiliere_B_fkey";

-- DropForeignKey
ALTER TABLE "_FiliereToInstitution" DROP CONSTRAINT "_FiliereToInstitution_A_fkey";

-- DropForeignKey
ALTER TABLE "_FiliereToInstitution" DROP CONSTRAINT "_FiliereToInstitution_B_fkey";

-- DropForeignKey
ALTER TABLE "_FiliereToProfesseur" DROP CONSTRAINT "_FiliereToProfesseur_A_fkey";

-- DropForeignKey
ALTER TABLE "_FiliereToProfesseur" DROP CONSTRAINT "_FiliereToProfesseur_B_fkey";

-- DropForeignKey
ALTER TABLE "validation_certification" DROP CONSTRAINT "validation_certification_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "validation_certification" DROP CONSTRAINT "validation_certification_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "validation_du_projet" DROP CONSTRAINT "validation_du_projet_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "validation_du_projet" DROP CONSTRAINT "validation_du_projet_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "validation_stage" DROP CONSTRAINT "validation_stage_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "validation_stage" DROP CONSTRAINT "validation_stage_utilisateur_id_fkey";

-- DropTable
DROP TABLE "_EtudiantToFiliere";

-- DropTable
DROP TABLE "_FiliereToInstitution";

-- DropTable
DROP TABLE "_FiliereToProfesseur";

-- DropTable
DROP TABLE "filieres";

-- DropTable
DROP TABLE "validation_certification";

-- DropTable
DROP TABLE "validation_du_projet";

-- DropTable
DROP TABLE "validation_stage";

-- CreateTable
CREATE TABLE "valide_projet" (
    "experience_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),
    "commentaire" TEXT,

    CONSTRAINT "valide_projet_pkey" PRIMARY KEY ("experience_id","utilisateur_id")
);

-- CreateTable
CREATE TABLE "valide_stage" (
    "utilisateur_id" TEXT NOT NULL,
    "experience_id" TEXT NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),
    "commentaire" TEXT,

    CONSTRAINT "valide_stage_pkey" PRIMARY KEY ("utilisateur_id","experience_id")
);

-- CreateTable
CREATE TABLE "valide_certification" (
    "institution_id" TEXT NOT NULL,
    "experience_id" TEXT NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),
    "commentaire" TEXT,

    CONSTRAINT "valide_certification_pkey" PRIMARY KEY ("institution_id","experience_id")
);

-- CreateTable
CREATE TABLE "valide_etudiant" (
    "utilisateur_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),

    CONSTRAINT "valide_etudiant_pkey" PRIMARY KEY ("utilisateur_id","institution_id")
);

-- CreateTable
CREATE TABLE "_InstitutionToProfesseur" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstitutionToProfesseur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "valide_projet_experience_id_key" ON "valide_projet"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "valide_stage_experience_id_key" ON "valide_stage"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "valide_certification_experience_id_key" ON "valide_certification"("experience_id");

-- CreateIndex
CREATE INDEX "_InstitutionToProfesseur_B_index" ON "_InstitutionToProfesseur"("B");

-- AddForeignKey
ALTER TABLE "valide_projet" ADD CONSTRAINT "valide_projet_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "projets"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_projet" ADD CONSTRAINT "valide_projet_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_stage" ADD CONSTRAINT "valide_stage_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_stage" ADD CONSTRAINT "valide_stage_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "stages"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_certification" ADD CONSTRAINT "valide_certification_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_certification" ADD CONSTRAINT "valide_certification_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "certifications"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_etudiant" ADD CONSTRAINT "valide_etudiant_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_etudiant" ADD CONSTRAINT "valide_etudiant_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionToProfesseur" ADD CONSTRAINT "_InstitutionToProfesseur_A_fkey" FOREIGN KEY ("A") REFERENCES "institutions"("institution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionToProfesseur" ADD CONSTRAINT "_InstitutionToProfesseur_B_fkey" FOREIGN KEY ("B") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;
