import prisma from '../config/prisma.js';
import { getStagesVisiblesByEtudiant } from './stage.service.js';
import { getProjetsVisiblesByEtudiant } from './projet.service.js';
import { getActivitesVisiblesByEtudiant } from './activite.service.js';
import { getCertificationsVisiblesByEtudiant } from './certification.service.js';

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

export async function getPortfolioEtudiant(etudiantId) {
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
        },
      },
      portfolio: true,
      badges: true,
      clubs: true,
      recommandations: {
        select: {
          type_candidature: true,
          fichier: true,
          statut: true,
          date_lettre: true,
          commentaire: true,
          professeur: {
            include: {
              utilisateur: { select: { nom: true, prenom: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!etudiant) throw new Error('Étudiant non trouvé');

  const [stages, projets, activites, certifications] = await Promise.all([
    getStagesVisiblesByEtudiant(etudiantId),
    getProjetsVisiblesByEtudiant(etudiantId),
    getActivitesVisiblesByEtudiant(etudiantId),
    getCertificationsVisiblesByEtudiant(etudiantId),
  ]);

  return {
    ...etudiant,
    stages,
    projets,
    activites,
    certifications,
  };
}