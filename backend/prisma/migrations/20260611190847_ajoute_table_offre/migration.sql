-- CreateEnum
CREATE TYPE "TypeOffre" AS ENUM ('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Interim', 'Temps_partiel', 'Temps_plein', 'Apprentissage', 'Contrat_professionnel', 'VIE', 'Benevolat', 'Consultant', 'Projet_Mission_courte');

-- DropForeignKey
ALTER TABLE "Competences_Developpees" DROP CONSTRAINT "Competences_Developpees_competence_id_fkey";

-- DropForeignKey
ALTER TABLE "Competences_Developpees" DROP CONSTRAINT "Competences_Developpees_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_utilisateur_cible_id_fkey";

-- DropForeignKey
ALTER TABLE "activites" DROP CONSTRAINT "activites_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "administrateurs" DROP CONSTRAINT "administrateurs_admin_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "certifications" DROP CONSTRAINT "certifications_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "connexions" DROP CONSTRAINT "connexions_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "directeurs" DROP CONSTRAINT "directeurs_directeur_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "directeurs" DROP CONSTRAINT "directeurs_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "etudiants" DROP CONSTRAINT "etudiants_etudiant_utilisateur_id_fkey";

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
ALTER TABLE "portfolio" DROP CONSTRAINT "portfolio_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "portfolio_score_history" DROP CONSTRAINT "portfolio_score_history_portfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "professeurs" DROP CONSTRAINT "professeurs_prof_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "professionnels" DROP CONSTRAINT "professionnels_professionnel_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "projets" DROP CONSTRAINT "projets_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "repositories" DROP CONSTRAINT "repositories_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "stages" DROP CONSTRAINT "stages_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_activite" DROP CONSTRAINT "valide_activite_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_activite" DROP CONSTRAINT "valide_activite_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_etudiant" DROP CONSTRAINT "valide_etudiant_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_etudiant" DROP CONSTRAINT "valide_etudiant_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_projet" DROP CONSTRAINT "valide_projet_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_projet" DROP CONSTRAINT "valide_projet_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_stage" DROP CONSTRAINT "valide_stage_experience_id_fkey";

-- DropForeignKey
ALTER TABLE "valide_stage" DROP CONSTRAINT "valide_stage_utilisateur_id_fkey";

-- CreateTable
CREATE TABLE "offres" (
    "offre_id" TEXT NOT NULL,
    "entreprise" VARCHAR(100),
    "localisation" VARCHAR(150),
    "technologies" JSONB,
    "description" TEXT,
    "type" "TypeOffre",
    "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "offres_pkey" PRIMARY KEY ("offre_id")
);

-- CreateTable
CREATE TABLE "demandes" (
    "message" TEXT,
    "offre_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "demandes_pkey" PRIMARY KEY ("offre_id","utilisateur_id")
);

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_admin_utilisateur_id_fkey" FOREIGN KEY ("admin_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directeurs" ADD CONSTRAINT "directeurs_directeur_utilisateur_id_fkey" FOREIGN KEY ("directeur_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directeurs" ADD CONSTRAINT "directeurs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_etudiant_utilisateur_id_fkey" FOREIGN KEY ("etudiant_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeurs" ADD CONSTRAINT "professeurs_prof_utilisateur_id_fkey" FOREIGN KEY ("prof_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnels" ADD CONSTRAINT "professionnels_professionnel_utilisateur_id_fkey" FOREIGN KEY ("professionnel_utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offres" ADD CONSTRAINT "offres_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_offre_id_fkey" FOREIGN KEY ("offre_id") REFERENCES "offres"("offre_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_score_history" ADD CONSTRAINT "portfolio_score_history_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("portfolio_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateur_cible_id_fkey" FOREIGN KEY ("utilisateur_cible_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connexions" ADD CONSTRAINT "connexions_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites" ADD CONSTRAINT "activites_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("portfolio_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_de_recommendations" ADD CONSTRAINT "lettres_de_recommendations_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_de_recommendations" ADD CONSTRAINT "lettres_de_recommendations_prof_utilisateur_id_fkey" FOREIGN KEY ("prof_utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competences_Developpees" ADD CONSTRAINT "Competences_Developpees_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competences_Developpees" ADD CONSTRAINT "Competences_Developpees_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competences"("competence_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "activites"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_activite" ADD CONSTRAINT "valide_activite_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_projet" ADD CONSTRAINT "valide_projet_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "projets"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_projet" ADD CONSTRAINT "valide_projet_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_stage" ADD CONSTRAINT "valide_stage_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "professeurs"("prof_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_stage" ADD CONSTRAINT "valide_stage_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "stages"("experience_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_etudiant" ADD CONSTRAINT "valide_etudiant_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valide_etudiant" ADD CONSTRAINT "valide_etudiant_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_etudiant_id_fkey" FOREIGN KEY ("etudiant_id") REFERENCES "etudiants"("etudiant_utilisateur_id") ON DELETE CASCADE ON UPDATE CASCADE;
