import prisma from '../config/prisma.js';
import { getStagesVisiblesByEtudiant, getStagesByEtudiant } from './stage.service.js';
import { getProjetsVisiblesByEtudiant, getProjetsByEtudiant } from './projet.service.js';
import { getActivitesVisiblesByEtudiant, getActivitesByEtudiant } from './activite.service.js';
import { getCertificationsVisiblesByEtudiant, getCertificationsByEtudiant } from './certification.service.js';

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