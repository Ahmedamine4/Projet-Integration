/*
  Warnings:

  - The values [admin,administration] on the enum `RoleUtilisateur` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `activites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `administrateurs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `badges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `certifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `clubs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `competences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `connexions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `documentations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `etudiants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `experiences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `filieres` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `institutions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `interactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `lettres_de_recommendations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `portfolio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `professeurs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `professionnels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `projets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `stages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `utilisateurs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `validation_certification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `validation_du_projet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `validation_stage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `valide_activite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `adherent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `administrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `appartient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `develope` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enseigne` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etudie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `obtient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reconnait` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[experience_id]` on the table `validation_certification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[experience_id]` on the table `validation_du_projet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[experience_id]` on the table `validation_stage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[experience_id]` on the table `valide_activite` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nom` on table `institutions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `institutions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `utilisateurs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleUtilisateur_new" AS ENUM ('etudiant', 'professeur', 'administrateur', 'professionnel', 'directeur');
ALTER TABLE "utilisateurs" ALTER COLUMN "role" TYPE "RoleUtilisateur_new" USING ("role"::text::"RoleUtilisateur_new");
ALTER TYPE "RoleUtilisateur" RENAME TO "RoleUtilisateur_old";
ALTER TYPE "RoleUtilisateur_new" RENAME TO "RoleUtilisateur";
DROP TYPE "public"."RoleUtilisateur_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "activites" DROP CONSTRAINT "activites_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "adherent" DROP CONSTRAINT "adherent_club_id_fkey";

-- DropForeignKey
ALTER TABLE "adherent" DROP CONSTRAINT "adherent_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "administrateurs" DROP CONSTRAINT "administrateurs_admin_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "administrations" DROP CONSTRAINT "administrations_admin_inst_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "administrations" DROP CONSTRAINT "administrations_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "appartient" DROP CONSTRAINT "appartient_filiere_id_fkey";

-- DropForeignKey
ALTER TABLE "appartient" DROP CONSTRAINT "appartient_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "connexions" DROP CONSTRAINT "connexions_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "develope" DROP CONSTRAINT "develope_competence_id_fkey";

-- DropForeignKey
ALTER TABLE "develope" DROP CONSTRAINT "develope_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "documentations" DROP CONSTRAINT "documentations_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "enseigne" DROP CONSTRAINT "enseigne_filiere_id_fkey";

-- DropForeignKey
ALTER TABLE "enseigne" DROP CONSTRAINT "enseigne_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "etudiants" DROP CONSTRAINT "etudiants_etudiant_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "etudie" DROP CONSTRAINT "etudie_filiere_id_fkey";

-- DropForeignKey
ALTER TABLE "etudie" DROP CONSTRAINT "etudie_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "experiences" DROP CONSTRAINT "experiences_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_portfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "lettres_de_recommendations" DROP CONSTRAINT "lettres_de_recommendations_prof_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "lettres_de_recommendations" DROP CONSTRAINT "lettres_de_recommendations_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "obtient" DROP CONSTRAINT "obtient_badge_id_fkey";

-- DropForeignKey
ALTER TABLE "obtient" DROP CONSTRAINT "obtient_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "organise" DROP CONSTRAINT "organise_club_id_fkey";

-- DropForeignKey
ALTER TABLE "organise" DROP CONSTRAINT "organise_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "portfolio" DROP CONSTRAINT "portfolio_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "professeurs" DROP CONSTRAINT "professeurs_prof_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "professionnels" DROP CONSTRAINT "professionnels_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "professionnels" DROP CONSTRAINT "professionnels_professionnel_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "projets" DROP CONSTRAINT "projets_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "reconnait" DROP CONSTRAINT "reconnait_club_id_fkey";

-- DropForeignKey
ALTER TABLE "reconnait" DROP CONSTRAINT "reconnait_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "stages" DROP CONSTRAINT "stages_experience_id_fkey";

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

-- DropForeignKey
ALTER TABLE "valide_activite" DROP CONSTRAINT "valide_activite_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_activite" DROP CONSTRAINT "valide_activite_institution_id_fkey";

-- AlterTable
ALTER TABLE "activites" DROP CONSTRAINT "activites_pkey",
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "activites_pkey" PRIMARY KEY ("experience_id");

-- AlterTable
ALTER TABLE "administrateurs" DROP CONSTRAINT "administrateurs_pkey",
ALTER COLUMN "admin_utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("admin_utilisateur_id");

-- AlterTable
ALTER TABLE "badges" DROP CONSTRAINT "badges_pkey",
ALTER COLUMN "badge_id" DROP DEFAULT,
ALTER COLUMN "badge_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("badge_id");
DROP SEQUENCE "badges_badge_id_seq";

-- AlterTable
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_pkey",
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "certifications_pkey" PRIMARY KEY ("experience_id");

-- AlterTable
ALTER TABLE "clubs" DROP CONSTRAINT "clubs_pkey",
ALTER COLUMN "club_id" DROP DEFAULT,
ALTER COLUMN "club_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "clubs_pkey" PRIMARY KEY ("club_id");
DROP SEQUENCE "clubs_club_id_seq";

-- AlterTable
ALTER TABLE "competences" DROP CONSTRAINT "competences_pkey",
ALTER COLUMN "competence_id" DROP DEFAULT,
ALTER COLUMN "competence_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "competences_pkey" PRIMARY KEY ("competence_id");
DROP SEQUENCE "competences_competence_id_seq";

-- AlterTable
ALTER TABLE "connexions" DROP CONSTRAINT "connexions_pkey",
ALTER COLUMN "connexion_id" DROP DEFAULT,
ALTER COLUMN "connexion_id" SET DATA TYPE TEXT,
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "connexions_pkey" PRIMARY KEY ("connexion_id");
DROP SEQUENCE "connexions_connexion_id_seq";

-- AlterTable
ALTER TABLE "documentations" DROP CONSTRAINT "documentations_pkey",
ALTER COLUMN "documentation_id" DROP DEFAULT,
ALTER COLUMN "documentation_id" SET DATA TYPE TEXT,
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "documentations_pkey" PRIMARY KEY ("documentation_id");
DROP SEQUENCE "documentations_documentation_id_seq";

-- AlterTable
ALTER TABLE "etudiants" DROP CONSTRAINT "etudiants_pkey",
ALTER COLUMN "etudiant_utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "etudiants_pkey" PRIMARY KEY ("etudiant_utilisateur_id");

-- AlterTable
ALTER TABLE "experiences" DROP CONSTRAINT "experiences_pkey",
ALTER COLUMN "experience_id" DROP DEFAULT,
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "experiences_pkey" PRIMARY KEY ("experience_id");
DROP SEQUENCE "experiences_experience_id_seq";

-- AlterTable
ALTER TABLE "filieres" DROP CONSTRAINT "filieres_pkey",
ALTER COLUMN "filiere_id" DROP DEFAULT,
ALTER COLUMN "filiere_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "filieres_pkey" PRIMARY KEY ("filiere_id");
DROP SEQUENCE "filieres_filiere_id_seq";

-- AlterTable
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_pkey",
ALTER COLUMN "institution_id" DROP DEFAULT,
ALTER COLUMN "institution_id" SET DATA TYPE TEXT,
ALTER COLUMN "nom" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ADD CONSTRAINT "institutions_pkey" PRIMARY KEY ("institution_id");
DROP SEQUENCE "institutions_institution_id_seq";

-- AlterTable
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_pkey",
ALTER COLUMN "interaction_id" DROP DEFAULT,
ALTER COLUMN "interaction_id" SET DATA TYPE TEXT,
ALTER COLUMN "portfolio_id" SET DATA TYPE TEXT,
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "interactions_pkey" PRIMARY KEY ("interaction_id");
DROP SEQUENCE "interactions_interaction_id_seq";

-- AlterTable
ALTER TABLE "lettres_de_recommendations" DROP CONSTRAINT "lettres_de_recommendations_pkey",
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ALTER COLUMN "prof_utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "lettres_de_recommendations_pkey" PRIMARY KEY ("utilisateur_id", "prof_utilisateur_id");

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "notification_id" DROP DEFAULT,
ALTER COLUMN "notification_id" SET DATA TYPE TEXT,
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id");
DROP SEQUENCE "notifications_notification_id_seq";

-- AlterTable
ALTER TABLE "portfolio" DROP CONSTRAINT "portfolio_pkey",
ALTER COLUMN "portfolio_id" DROP DEFAULT,
ALTER COLUMN "portfolio_id" SET DATA TYPE TEXT,
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "portfolio_pkey" PRIMARY KEY ("portfolio_id");
DROP SEQUENCE "portfolio_portfolio_id_seq";

-- AlterTable
ALTER TABLE "professeurs" DROP CONSTRAINT "professeurs_pkey",
ALTER COLUMN "prof_utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "professeurs_pkey" PRIMARY KEY ("prof_utilisateur_id");

-- AlterTable
ALTER TABLE "professionnels" DROP CONSTRAINT "professionnels_pkey",
ALTER COLUMN "professionnel_utilisateur_id" SET DATA TYPE TEXT,
ALTER COLUMN "admin_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "professionnels_pkey" PRIMARY KEY ("professionnel_utilisateur_id");

-- AlterTable
ALTER TABLE "projets" DROP CONSTRAINT "projets_pkey",
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "projets_pkey" PRIMARY KEY ("experience_id");

-- AlterTable
ALTER TABLE "stages" DROP CONSTRAINT "stages_pkey",
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "stages_pkey" PRIMARY KEY ("experience_id");

-- AlterTable
ALTER TABLE "utilisateurs" DROP CONSTRAINT "utilisateurs_pkey",
ADD COLUMN     "telephone" VARCHAR(20),
ALTER COLUMN "utilisateur_id" DROP DEFAULT,
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "date_de_creation" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("utilisateur_id");
DROP SEQUENCE "utilisateurs_utilisateur_id_seq";

-- AlterTable
ALTER TABLE "validation_certification" DROP CONSTRAINT "validation_certification_pkey",
ALTER COLUMN "institution_id" SET DATA TYPE TEXT,
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "validation_certification_pkey" PRIMARY KEY ("institution_id", "experience_id");

-- AlterTable
ALTER TABLE "validation_du_projet" DROP CONSTRAINT "validation_du_projet_pkey",
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "validation_du_projet_pkey" PRIMARY KEY ("experience_id", "utilisateur_id");

-- AlterTable
ALTER TABLE "validation_stage" DROP CONSTRAINT "validation_stage_pkey",
ALTER COLUMN "utilisateur_id" SET DATA TYPE TEXT,
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "validation_stage_pkey" PRIMARY KEY ("utilisateur_id", "experience_id");

-- AlterTable
ALTER TABLE "valide_activite" DROP CONSTRAINT "valide_activite_pkey",
ADD COLUMN     "commentaire" TEXT,
ADD COLUMN     "date_d_action" TIMESTAMP(3),
ADD COLUMN     "statut" "StatutValidation",
ALTER COLUMN "experience_id" SET DATA TYPE TEXT,
ALTER COLUMN "institution_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "valide_activite_pkey" PRIMARY KEY ("experience_id", "institution_id");

-- DropTable
DROP TABLE "adherent";

-- DropTable
DROP TABLE "administrations";

-- DropTable
DROP TABLE "appartient";

-- DropTable
DROP TABLE "develope";

-- DropTable
DROP TABLE "enseigne";

-- DropTable
DROP TABLE "etudie";

-- DropTable
DROP TABLE "obtient";

-- DropTable
DROP TABLE "organise";

-- DropTable
DROP TABLE "reconnait";

-- CreateTable
CREATE TABLE "directeurs" (
    "directeur_utilisateur_id" TEXT NOT NULL,
    "poste" VARCHAR(100),
    "bureau" VARCHAR(50),
    "institution_id" TEXT NOT NULL,

    CONSTRAINT "directeurs_pkey" PRIMARY KEY ("directeur_utilisateur_id")
);

-- CreateTable
CREATE TABLE "_EtudiantToFiliere" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EtudiantToFiliere_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FiliereToProfesseur" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FiliereToProfesseur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FiliereToInstitution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FiliereToInstitution_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClubToEtudiant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClubToEtudiant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClubToInstitution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClubToInstitution_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BadgeToEtudiant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BadgeToEtudiant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CompetenceToExperience" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompetenceToExperience_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActiviteToClub" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActiviteToClub_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "directeurs_institution_id_key" ON "directeurs"("institution_id");

-- CreateIndex
CREATE INDEX "_EtudiantToFiliere_B_index" ON "_EtudiantToFiliere"("B");

-- CreateIndex
CREATE INDEX "_FiliereToProfesseur_B_index" ON "_FiliereToProfesseur"("B");

-- CreateIndex
CREATE INDEX "_FiliereToInstitution_B_index" ON "_FiliereToInstitution"("B");

-- CreateIndex
CREATE INDEX "_ClubToEtudiant_B_index" ON "_ClubToEtudiant"("B");

-- CreateIndex
CREATE INDEX "_ClubToInstitution_B_index" ON "_ClubToInstitution"("B");

-- CreateIndex
CREATE INDEX "_BadgeToEtudiant_B_index" ON "_BadgeToEtudiant"("B");

-- CreateIndex
CREATE INDEX "_CompetenceToExperience_B_index" ON "_CompetenceToExperience"("B");

-- CreateIndex
CREATE INDEX "_ActiviteToClub_B_index" ON "_ActiviteToClub"("B");

-- CreateIndex
CREATE UNIQUE INDEX "validation_certification_experience_id_key" ON "validation_certification"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "validation_du_projet_experience_id_key" ON "validation_du_projet"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "validation_stage_experience_id_key" ON "validation_stage"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "valide_activite_experience_id_key" ON "valide_activite"("experience_id");

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_admin_utilisateur_id_fkey" FOREIGN KEY ("admin_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directeurs" ADD CONSTRAINT "directeurs_directeur_utilisateur_id_fkey" FOREIGN KEY ("directeur_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directeurs" ADD CONSTRAINT "directeurs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_etudiant_utilisateur_id_fkey" FOREIGN KEY ("etudiant_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeurs" ADD CONSTRAINT "professeurs_prof_utilisateur_id_fkey" FOREIGN KEY ("prof_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnels" ADD CONSTRAINT "professionnels_professionnel_utilisateur_id_fkey" FOREIGN KEY ("professionnel_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnels" ADD CONSTRAINT "professionnels_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "administrateurs"("admin_utilisateur_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connexions" ADD CONSTRAINT "connexions_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentations" ADD CONSTRAINT "documentations_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites" ADD CONSTRAINT "activites_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("portfolio_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_de_recommendations" ADD CONSTRAINT "lettres_de_recommendations_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_de_recommendations" ADD CONSTRAINT "lettres_de_recommendations_prof_utilisateur_id_fkey" FOREIGN KEY ("prof_utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "activites"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_du_projet" ADD CONSTRAINT "validation_du_projet_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "projets"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_du_projet" ADD CONSTRAINT "validation_du_projet_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_stage" ADD CONSTRAINT "validation_stage_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_stage" ADD CONSTRAINT "validation_stage_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "stages"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_certification" ADD CONSTRAINT "validation_certification_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_certification" ADD CONSTRAINT "validation_certification_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "certifications"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtudiantToFiliere" ADD CONSTRAINT "_EtudiantToFiliere_A_fkey" FOREIGN KEY ("A") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtudiantToFiliere" ADD CONSTRAINT "_EtudiantToFiliere_B_fkey" FOREIGN KEY ("B") REFERENCES "filieres"("filiere_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FiliereToProfesseur" ADD CONSTRAINT "_FiliereToProfesseur_A_fkey" FOREIGN KEY ("A") REFERENCES "filieres"("filiere_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FiliereToProfesseur" ADD CONSTRAINT "_FiliereToProfesseur_B_fkey" FOREIGN KEY ("B") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FiliereToInstitution" ADD CONSTRAINT "_FiliereToInstitution_A_fkey" FOREIGN KEY ("A") REFERENCES "filieres"("filiere_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FiliereToInstitution" ADD CONSTRAINT "_FiliereToInstitution_B_fkey" FOREIGN KEY ("B") REFERENCES "institutions"("institution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubToEtudiant" ADD CONSTRAINT "_ClubToEtudiant_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("club_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubToEtudiant" ADD CONSTRAINT "_ClubToEtudiant_B_fkey" FOREIGN KEY ("B") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubToInstitution" ADD CONSTRAINT "_ClubToInstitution_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("club_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubToInstitution" ADD CONSTRAINT "_ClubToInstitution_B_fkey" FOREIGN KEY ("B") REFERENCES "institutions"("institution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BadgeToEtudiant" ADD CONSTRAINT "_BadgeToEtudiant_A_fkey" FOREIGN KEY ("A") REFERENCES "badges"("badge_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BadgeToEtudiant" ADD CONSTRAINT "_BadgeToEtudiant_B_fkey" FOREIGN KEY ("B") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetenceToExperience" ADD CONSTRAINT "_CompetenceToExperience_A_fkey" FOREIGN KEY ("A") REFERENCES "competences"("competence_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetenceToExperience" ADD CONSTRAINT "_CompetenceToExperience_B_fkey" FOREIGN KEY ("B") REFERENCES "experiences"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiviteToClub" ADD CONSTRAINT "_ActiviteToClub_A_fkey" FOREIGN KEY ("A") REFERENCES "activites"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiviteToClub" ADD CONSTRAINT "_ActiviteToClub_B_fkey" FOREIGN KEY ("B") REFERENCES "clubs"("club_id") ON DELETE CASCADE ON UPDATE CASCADE;
