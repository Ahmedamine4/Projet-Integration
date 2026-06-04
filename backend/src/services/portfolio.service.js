import prisma from '../config/prisma.js';
import { getStagesVisiblesByEtudiant, getStagesByEtudiant } from './stage.service.js';
import { getProjetsVisiblesByEtudiant, getProjetsByEtudiant } from './projet.service.js';
import { getActivitesVisiblesByEtudiant, getActivitesByEtudiant } from './activite.service.js';
import { getCertificationsVisiblesByEtudiant, getCertificationsByEtudiant } from './certification.service.js';
import { getCompetencesByExperience } from './competence.helper.js';

// Recuperer "a_propos" d'un utilisateur par son id
export async function getAboutByUserId(userId) {
  const user = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: userId },
    select: { utilisateur_id: true, a_propos: true },
  });

  if (!user) return null;

  return { ownerId: user.utilisateur_id, about: user.a_propos ?? null };
}

// modifier le "a_propos" d'un utilisateur par son id
export async function updateUserAboutByUserId(userId, aboutText) {
  return prisma.utilisateur.update({
    where: { utilisateur_id: userId },
    data: { a_propos: aboutText },
    select: { utilisateur_id: true, a_propos: true },
  });
}

export async function getPortfolioEtudiant(etudiantId, isOwner) {
  const etudiant = await prisma.etudiant.findUnique({
    where: { etudiant_utilisateur_id: etudiantId },
    include: {
      utilisateur: {
        select: {
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          a_propos: true,
          github: true,
          instagram: true,
          x: true,
          linkedin: true,
        },
      },
      portfolio: true,
      badges: true,
      clubs: true,
    },
  });

  if (!etudiant) throw new Error('Étudiant non trouvé');

  const [stages, projets, activites, certifications] = await Promise.all([
    isOwner ? getStagesByEtudiant(etudiantId) : getStagesVisiblesByEtudiant(etudiantId),
    isOwner ? getProjetsByEtudiant(etudiantId) : getProjetsVisiblesByEtudiant(etudiantId),
    isOwner ? getActivitesByEtudiant(etudiantId) : getActivitesVisiblesByEtudiant(etudiantId),
    isOwner ? getCertificationsByEtudiant(etudiantId) : getCertificationsVisiblesByEtudiant(etudiantId),
  ]);

  return {
    ...etudiant,
    isOwner,
    stages,
    projets,
    activites,
    certifications,
  };
}

export async function getExperienceById(experienceId) {
  
  const experience = await prisma.experience.findUnique({
    where: { experience_id: experienceId },
    include: {
      stage: {
        include: { validation: { include: { professeur: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } } } } },
      },
      projet: {
        include: { validation: { include: { professeur: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } } } } },
      },
      activite: {
        include: {
          validation: { include: { institution: true } },
          clubs: true,
        },
      },
      certification: {
        include: { validation: { include: { institution: true } } },
      },
    },
  });
 
  if (!experience) return null;
 
  const { technologies, domaines } = await getCompetencesByExperience(experienceId);
 
  const typeSpecifique = experience.type;
  let details = null;
 
  if (typeSpecifique === 'stage') details = experience.stage;
  else if (typeSpecifique === 'projet') details = experience.projet;
  else if (typeSpecifique === 'activite') details = experience.activite;
  else if (typeSpecifique === 'certification') details = experience.certification;
 
  return {
    experience_id: experience.experience_id,
    titre: experience.titre,
    type: experience.type,
    type_specifique: experience.type_specifique ?? null,
    date_experience: experience.date_experience,
    description: experience.description,
    photo: experience.photo ?? null,
    visibilite: experience.visibilite,
    is_draft: experience.is_draft,
    utilisateur_id: experience.utilisateur_id,
    technologies,
    domaines,
    details,
  };
}