import prisma from '../config/prisma.js';
import { creerNotification, TYPES_NOTIFICATION } from './notification.service.js';

export const getPendingValidations = async (institutionId) => {
  return prisma.valideEtudiant.findMany({
    where: {
      institution_id: institutionId,
      statut: 'en_attente',
    },
    include: {
      etudiant: {
        include: {
          utilisateur: {
            select: {
              utilisateur_id: true,
              nom: true,
              prenom: true,
              email: true,
              photo: true,
            },
          },
        },
      },
    },
  });
};

export const updateValidationStatus = async (etudiantId, institutionId, newStatus) => {
  const validation = await prisma.valideEtudiant.update({
    where: {
      utilisateur_id_institution_id: {
        utilisateur_id: etudiantId,
        institution_id: institutionId,
      },
    },
    data: {
      statut: newStatus,
      date: new Date(),
    },
    include: {
      etudiant: {
        include: {
          utilisateur: {
            select: {
              utilisateur_id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (newStatus === 'valide') {
    await creerNotification(
      etudiantId,
      "Votre demande d'inscription a ete validee.",
      TYPES_NOTIFICATION.VALIDATION_ETUDIANT_ACCEPTEE,
    );
  }

  if (newStatus === 'refuse') {
    await creerNotification(
      etudiantId,
      "Votre demande d'inscription a ete refusee.",
      TYPES_NOTIFICATION.VALIDATION_ETUDIANT_REFUSEE,
    );
  }

  return validation;
};
