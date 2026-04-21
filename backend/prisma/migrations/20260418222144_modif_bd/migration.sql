/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('etudiant', 'professeur', 'admin', 'professionnel');

-- CreateEnum
CREATE TYPE "StatutValidation" AS ENUM ('en_attente', 'valide', 'refuse');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "utilisateurs" (
    "utilisateur_id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "role" "RoleUtilisateur",
    "email" VARCHAR(100) NOT NULL,
    "mot_de_passe" VARCHAR(255),
    "date_de_creation" TIMESTAMP(3),

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("utilisateur_id")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "admin_utilisateur_id" INTEGER NOT NULL,
    "niveau_acces" VARCHAR(50),

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("admin_utilisateur_id")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "etudiant_utilisateur_id" INTEGER NOT NULL,
    "promotion" VARCHAR(50),
    "niveau" VARCHAR(50),
    "github_API" TEXT,

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("etudiant_utilisateur_id")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "prof_utilisateur_id" INTEGER NOT NULL,
    "departement" VARCHAR(50),
    "specialite" VARCHAR(50),

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("prof_utilisateur_id")
);

-- CreateTable
CREATE TABLE "professionnels" (
    "professionnel_utilisateur_id" INTEGER NOT NULL,
    "entreprise" VARCHAR(100),
    "post" VARCHAR(50),
    "email_professionnel" VARCHAR(100),
    "statut" "StatutValidation",
    "admin_id" INTEGER,

    CONSTRAINT "professionnels_pkey" PRIMARY KEY ("professionnel_utilisateur_id")
);

-- CreateTable
CREATE TABLE "filieres" (
    "filiere_id" SERIAL NOT NULL,
    "nom" VARCHAR(50),

    CONSTRAINT "filieres_pkey" PRIMARY KEY ("filiere_id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "club_id" SERIAL NOT NULL,
    "nom" VARCHAR(50),
    "description" TEXT,
    "date_creation" TIMESTAMP(3),
    "responsable" VARCHAR(50),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("club_id")
);

-- CreateTable
CREATE TABLE "badges" (
    "badge_id" SERIAL NOT NULL,
    "nom" VARCHAR(50),
    "icone" TEXT,
    "score" INTEGER,
    "description" TEXT,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("badge_id")
);

-- CreateTable
CREATE TABLE "competences" (
    "competence_id" SERIAL NOT NULL,
    "type" VARCHAR(50),
    "nom" VARCHAR(50),
    "description" TEXT,
    "niveau" VARCHAR(50),

    CONSTRAINT "competences_pkey" PRIMARY KEY ("competence_id")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "portfolio_id" SERIAL NOT NULL,
    "titre" VARCHAR(100),
    "objectif_cible" VARCHAR(100),
    "visibilite" BOOLEAN,
    "date_generation" TIMESTAMP(3),
    "score_credibilite" INTEGER,
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("portfolio_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "message" TEXT,
    "date_notification" TIMESTAMP(3),
    "lu" BOOLEAN,
    "type" VARCHAR(50),
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "connexions" (
    "connexion_id" SERIAL NOT NULL,
    "ip_address" VARCHAR(50),
    "statut" BOOLEAN,
    "date_de_connexion" TIMESTAMP(3),
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "connexions_pkey" PRIMARY KEY ("connexion_id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "institution_id" SERIAL NOT NULL,
    "nom" VARCHAR(50),
    "address" VARCHAR(50),
    "email" VARCHAR(255),
    "description" TEXT,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("institution_id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "experience_id" SERIAL NOT NULL,
    "titre" VARCHAR(100),
    "date_experience" TIMESTAMP(3),
    "visibilite" BOOLEAN,
    "type" VARCHAR(50),
    "description" TEXT,
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "experience_id" INTEGER NOT NULL,
    "document" TEXT,
    "lien_URL" TEXT,
    "code" TEXT,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "documentations" (
    "documentation_id" SERIAL NOT NULL,
    "captures" TEXT,
    "pdf" TEXT,
    "experience_id" INTEGER NOT NULL,

    CONSTRAINT "documentations_pkey" PRIMARY KEY ("documentation_id")
);

-- CreateTable
CREATE TABLE "projets" (
    "experience_id" INTEGER NOT NULL,
    "type_projet" VARCHAR(50),
    "lien_github" TEXT,
    "lien_youtube" TEXT,
    "resultat_obtenus" TEXT,
    "role" VARCHAR(50),

    CONSTRAINT "projets_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "activites" (
    "experience_id" INTEGER NOT NULL,
    "type" VARCHAR(50),
    "lieu" VARCHAR(100),

    CONSTRAINT "activites_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "stages" (
    "experience_id" INTEGER NOT NULL,
    "duree" VARCHAR(50),
    "missions_realisees" TEXT,
    "rapport_stage" TEXT,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "interaction_id" SERIAL NOT NULL,
    "type" VARCHAR(50),
    "texte" TEXT,
    "statut" "StatutValidation",
    "date_interaction" TIMESTAMP(3),
    "portfolio_id" INTEGER,
    "experience_id" INTEGER,
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("interaction_id")
);

-- CreateTable
CREATE TABLE "adherent" (
    "utilisateur_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,

    CONSTRAINT "adherent_pkey" PRIMARY KEY ("utilisateur_id","club_id")
);

-- CreateTable
CREATE TABLE "etudie" (
    "utilisateur_id" INTEGER NOT NULL,
    "filiere_id" INTEGER NOT NULL,

    CONSTRAINT "etudie_pkey" PRIMARY KEY ("utilisateur_id","filiere_id")
);

-- CreateTable
CREATE TABLE "reconnait" (
    "club_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,

    CONSTRAINT "reconnait_pkey" PRIMARY KEY ("club_id","institution_id")
);

-- CreateTable
CREATE TABLE "obtient" (
    "utilisateur_id" INTEGER NOT NULL,
    "badge_id" INTEGER NOT NULL,

    CONSTRAINT "obtient_pkey" PRIMARY KEY ("utilisateur_id","badge_id")
);

-- CreateTable
CREATE TABLE "lettres_de_recommendations" (
    "utilisateur_id" INTEGER NOT NULL,
    "prof_utilisateur_id" INTEGER NOT NULL,
    "type_candidature" VARCHAR(50),
    "fichier" TEXT,
    "statut" "StatutValidation",
    "date_lettre" TIMESTAMP(3),
    "commentaire" TEXT,

    CONSTRAINT "lettres_de_recommendations_pkey" PRIMARY KEY ("utilisateur_id","prof_utilisateur_id")
);

-- CreateTable
CREATE TABLE "enseigne" (
    "utilisateur_id" INTEGER NOT NULL,
    "filiere_id" INTEGER NOT NULL,

    CONSTRAINT "enseigne_pkey" PRIMARY KEY ("utilisateur_id","filiere_id")
);

-- CreateTable
CREATE TABLE "develope" (
    "competence_id" INTEGER NOT NULL,
    "experience_id" INTEGER NOT NULL,

    CONSTRAINT "develope_pkey" PRIMARY KEY ("competence_id","experience_id")
);

-- CreateTable
CREATE TABLE "valide_activite" (
    "experience_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,

    CONSTRAINT "valide_activite_pkey" PRIMARY KEY ("experience_id","institution_id")
);

-- CreateTable
CREATE TABLE "appartient" (
    "filiere_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,

    CONSTRAINT "appartient_pkey" PRIMARY KEY ("filiere_id","institution_id")
);

-- CreateTable
CREATE TABLE "organise" (
    "experience_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,

    CONSTRAINT "organise_pkey" PRIMARY KEY ("experience_id","club_id")
);

-- CreateTable
CREATE TABLE "validation_du_projet" (
    "experience_id" INTEGER NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),
    "commentaire" TEXT,
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "validation_du_projet_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "validation_stage" (
    "utilisateur_id" INTEGER NOT NULL,
    "experience_id" INTEGER NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),
    "commentaire" TEXT,

    CONSTRAINT "validation_stage_pkey" PRIMARY KEY ("utilisateur_id","experience_id")
);

-- CreateTable
CREATE TABLE "validation_certification" (
    "institution_id" INTEGER NOT NULL,
    "experience_id" INTEGER NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),
    "commentaire" TEXT,

    CONSTRAINT "validation_certification_pkey" PRIMARY KEY ("institution_id","experience_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_utilisateur_id_key" ON "portfolio"("utilisateur_id");

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_admin_utilisateur_id_fkey" FOREIGN KEY ("admin_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "adherent" ADD CONSTRAINT "adherent_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adherent" ADD CONSTRAINT "adherent_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudie" ADD CONSTRAINT "etudie_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudie" ADD CONSTRAINT "etudie_filiere_id_fkey" FOREIGN KEY ("filiere_id") REFERENCES "filieres"("filiere_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconnait" ADD CONSTRAINT "reconnait_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconnait" ADD CONSTRAINT "reconnait_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obtient" ADD CONSTRAINT "obtient_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obtient" ADD CONSTRAINT "obtient_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("badge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_de_recommendations" ADD CONSTRAINT "lettres_de_recommendations_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_de_recommendations" ADD CONSTRAINT "lettres_de_recommendations_prof_utilisateur_id_fkey" FOREIGN KEY ("prof_utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enseigne" ADD CONSTRAINT "enseigne_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enseigne" ADD CONSTRAINT "enseigne_filiere_id_fkey" FOREIGN KEY ("filiere_id") REFERENCES "filieres"("filiere_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "develope" ADD CONSTRAINT "develope_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competences"("competence_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "develope" ADD CONSTRAINT "develope_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "activites"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appartient" ADD CONSTRAINT "appartient_filiere_id_fkey" FOREIGN KEY ("filiere_id") REFERENCES "filieres"("filiere_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appartient" ADD CONSTRAINT "appartient_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organise" ADD CONSTRAINT "organise_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "activites"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organise" ADD CONSTRAINT "organise_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
