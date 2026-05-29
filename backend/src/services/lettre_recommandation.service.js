import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';

export const creerDemandeRecommandation = async (etudiantId, data) => {
  const { objet, description, email_professeur } = data;

  const professeur = await prisma.utilisateur.findUnique({
    where: { email: email_professeur },
    include: { professeur: true },
  });
  if (!professeur || !professeur.professeur) throw new Error('Professeur non trouvé avec cet email');

  const profId = professeur.professeur.prof_utilisateur_id;

  const demande = await prisma.lettresDeRecommendations.create({
    data: {
      utilisateur_id: etudiantId,
      prof_utilisateur_id: profId,
      objet,
      description: description ?? null,
      statut: 'en_attente',
      date_lettre: new Date(),
    },
    include: {
      professeur: {
        include: {
          utilisateur: { select: { nom: true, prenom: true, email: true } },
        },
      },
    },
  });

  const etudiant = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: etudiantId },
    select: { nom: true, prenom: true },
  });

  await creerNotification(
    professeur.utilisateur_id,
    `L'étudiant ${etudiant.prenom} ${etudiant.nom} vous demande une lettre de recommandation : "${objet}".`,
    'recommandation'
  );

  return demande;
};

export const getMesDemandesRecommandation = async (etudiantId) => {
  return prisma.lettresDeRecommendations.findMany({
    where: { utilisateur_id: etudiantId },
    include: {
      professeur: {
        include: {
          utilisateur: { select: { nom: true, prenom: true, email: true } },
        },
      },
    },
    orderBy: { date_lettre: 'desc' },
  });
};