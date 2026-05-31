-- CreateEnum
CREATE TYPE "TypeCompetence" AS ENUM ('technologie', 'domaine');

-- CreateEnum
CREATE TYPE "ActionSession" AS ENUM ('LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "TypeExperience" AS ENUM ('certification', 'projet', 'stage', 'activite');

-- CreateEnum
CREATE TYPE "TypeSpecifique" AS ENUM ('personnel', 'academique');

-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('etudiant', 'professeur', 'administrateur', 'professionnel', 'directeur');

-- CreateEnum
CREATE TYPE "StatutValidation" AS ENUM ('en_attente', 'valide', 'refuse');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "utilisateur_id" TEXT NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "supabase_uid" TEXT,
    "provider" TEXT DEFAULT 'local',
    "role" "RoleUtilisateur" NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mot_de_passe" VARCHAR(255),
    "telephone" VARCHAR(20),
    "a_propos" TEXT,
    "date_de_creation" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "github" TEXT,
    "instagram" TEXT,
    "x" TEXT,
    "linkedin" TEXT,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("utilisateur_id")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "admin_utilisateur_id" TEXT NOT NULL,
    "niveau_acces" VARCHAR(50),

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("admin_utilisateur_id")
);

-- CreateTable
CREATE TABLE "directeurs" (
    "directeur_utilisateur_id" TEXT NOT NULL,
    "poste" VARCHAR(100),
    "bureau" VARCHAR(50),
    "institution_id" TEXT NOT NULL,

    CONSTRAINT "directeurs_pkey" PRIMARY KEY ("directeur_utilisateur_id")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "etudiant_utilisateur_id" TEXT NOT NULL,
    "promotion" VARCHAR(50),
    "niveau" VARCHAR(50),
    "github_API" TEXT,

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("etudiant_utilisateur_id")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "prof_utilisateur_id" TEXT NOT NULL,
    "departement" VARCHAR(50),
    "specialite" VARCHAR(50),

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("prof_utilisateur_id")
);

-- CreateTable
CREATE TABLE "professionnels" (
    "professionnel_utilisateur_id" TEXT NOT NULL,
    "entreprise" VARCHAR(100),
    "poste" VARCHAR(50),
    "email_professionnel" VARCHAR(100),
    "statut" "StatutValidation",
    "admin_id" TEXT,

    CONSTRAINT "professionnels_pkey" PRIMARY KEY ("professionnel_utilisateur_id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "club_id" TEXT NOT NULL,
    "nom" VARCHAR(50),
    "description" TEXT,
    "date_creation" TIMESTAMP(3),
    "responsable" VARCHAR(50),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("club_id")
);

-- CreateTable
CREATE TABLE "badges" (
    "badge_id" TEXT NOT NULL,
    "nom" VARCHAR(50),
    "icone" TEXT,
    "score" INTEGER,
    "description" TEXT,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("badge_id")
);

-- CreateTable
CREATE TABLE "competences" (
    "competence_id" TEXT NOT NULL,
    "type" "TypeCompetence" NOT NULL,
    "nom" VARCHAR(50),
    "description" TEXT,

    CONSTRAINT "competences_pkey" PRIMARY KEY ("competence_id")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "portfolio_id" TEXT NOT NULL,
    "titre" VARCHAR(100),
    "objectif_cible" VARCHAR(100),
    "visibilite" BOOLEAN,
    "date_generation" TIMESTAMP(3),
    "score_credibilite" INTEGER,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("portfolio_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" TEXT NOT NULL,
    "message" TEXT,
    "date_notification" TIMESTAMP(3),
    "lu" BOOLEAN,
    "type" VARCHAR(50),
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "connexions" (
    "connexion_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "action" "ActionSession" NOT NULL,
    "browser" TEXT,
    "device_type" TEXT,
    "os" TEXT,
    "browser_version" TEXT,
    "ip" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "date_action" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connexions_pkey" PRIMARY KEY ("connexion_id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "institution_id" TEXT NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "addresse" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("institution_id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "experience_id" TEXT NOT NULL,
    "titre" VARCHAR(100),
    "date_experience" TIMESTAMP(3),
    "visibilite" BOOLEAN,
    "type" "TypeExperience" NOT NULL,
    "type_specifique" "TypeSpecifique",
    "description" TEXT,
    "photo" TEXT,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "technologies_locked" BOOLEAN NOT NULL DEFAULT false,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "experience_id" TEXT NOT NULL,
    "document" TEXT,
    "lien_URL" TEXT,
    "code" TEXT,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "projets" (
    "experience_id" TEXT NOT NULL,
    "repository_id" TEXT,
    "lien_github" TEXT,
    "lien_youtube" TEXT,
    "resultat_obtenu" TEXT,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "activites" (
    "experience_id" TEXT NOT NULL,
    "type" VARCHAR(50),
    "lieu" VARCHAR(100),

    CONSTRAINT "activites_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "stages" (
    "experience_id" TEXT NOT NULL,
    "date_fin" TIMESTAMP(3),
    "duree" VARCHAR(50),
    "missions_realisees" TEXT,
    "rapport_stage" TEXT,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "interaction_id" TEXT NOT NULL,
    "type" VARCHAR(50),
    "texte" TEXT,
    "statut" "StatutValidation",
    "date_interaction" TIMESTAMP(3),
    "portfolio_id" TEXT,
    "experience_id" TEXT,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("interaction_id")
);

-- CreateTable
CREATE TABLE "lettres_de_recommendations" (
    "utilisateur_id" TEXT NOT NULL,
    "prof_utilisateur_id" TEXT NOT NULL,
    "objet" VARCHAR(255),
    "description" TEXT,
    "fichier" TEXT,
    "statut" "StatutValidation" DEFAULT 'en_attente',
    "date_lettre" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "commentaire" TEXT,

    CONSTRAINT "lettres_de_recommendations_pkey" PRIMARY KEY ("utilisateur_id","prof_utilisateur_id")
);

-- CreateTable
CREATE TABLE "Competences_Developpees" (
    "experience_id" TEXT NOT NULL,
    "competence_id" TEXT NOT NULL,
    "niveau" TEXT,

    CONSTRAINT "Competences_Developpees_pkey" PRIMARY KEY ("experience_id","competence_id")
);

-- CreateTable
CREATE TABLE "valide_activite" (
    "experience_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "statut" "StatutValidation",
    "date_d_action" TIMESTAMP(3),
    "commentaire" TEXT,

    CONSTRAINT "valide_activite_pkey" PRIMARY KEY ("experience_id","institution_id")
);

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
    "date" TIMESTAMP(3),
    "description" TEXT,
    "niveau" TEXT,

    CONSTRAINT "valide_etudiant_pkey" PRIMARY KEY ("utilisateur_id","institution_id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "repository_id" TEXT NOT NULL,
    "github_id" INTEGER NOT NULL,
    "etudiant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "github_access_token" TEXT,
    "last_synced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("repository_id")
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
CREATE TABLE "_InstitutionToProfesseur" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstitutionToProfesseur_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActiviteToClub" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActiviteToClub_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_supabase_uid_key" ON "utilisateurs"("supabase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "directeurs_institution_id_key" ON "directeurs"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_utilisateur_id_key" ON "portfolio"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "projets_repository_id_key" ON "projets"("repository_id");

-- CreateIndex
CREATE UNIQUE INDEX "valide_activite_experience_id_key" ON "valide_activite"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "valide_projet_experience_id_key" ON "valide_projet"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "valide_stage_experience_id_key" ON "valide_stage"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "valide_certification_experience_id_key" ON "valide_certification"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_github_id_key" ON "repositories"("github_id");

-- CreateIndex
CREATE INDEX "_ClubToEtudiant_B_index" ON "_ClubToEtudiant"("B");

-- CreateIndex
CREATE INDEX "_ClubToInstitution_B_index" ON "_ClubToInstitution"("B");

-- CreateIndex
CREATE INDEX "_BadgeToEtudiant_B_index" ON "_BadgeToEtudiant"("B");

-- CreateIndex
CREATE INDEX "_InstitutionToProfesseur_B_index" ON "_InstitutionToProfesseur"("B");

-- CreateIndex
CREATE INDEX "_ActiviteToClub_B_index" ON "_ActiviteToClub"("B");

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
ALTER TABLE "projets" ADD CONSTRAINT "projets_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("repository_id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Competences_Developpees" ADD CONSTRAINT "Competences_Developpees_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competences_Developpees" ADD CONSTRAINT "Competences_Developpees_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competences"("competence_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "activites"("experience_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_etudiant_id_fkey" FOREIGN KEY ("etudiant_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "_InstitutionToProfesseur" ADD CONSTRAINT "_InstitutionToProfesseur_A_fkey" FOREIGN KEY ("A") REFERENCES "institutions"("institution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionToProfesseur" ADD CONSTRAINT "_InstitutionToProfesseur_B_fkey" FOREIGN KEY ("B") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiviteToClub" ADD CONSTRAINT "_ActiviteToClub_A_fkey" FOREIGN KEY ("A") REFERENCES "activites"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiviteToClub" ADD CONSTRAINT "_ActiviteToClub_B_fkey" FOREIGN KEY ("B") REFERENCES "clubs"("club_id") ON DELETE CASCADE ON UPDATE CASCADE;
