import prisma from '../config/prisma.js';
import { creerNotification, TYPES_NOTIFICATION } from './notification.service.js';

// Récupérer les demandes en attente pour une institution spécifique
export const getPendingValidations = async (institutionId) => {
    return await prisma.valideEtudiant.findMany({
        where: {
            institution_id: institutionId,
            statut: 'en_attente'
        },
        include: {
            etudiant: true // Pour afficher le nom de l'étudiant
        }
    });
};

// Mettre à jour le statut (valide / rejete)
export const updateValidationStatus = async (etudiantId, institutionId, newStatus) => {
  const validation = await prisma.valideEtudiant.update({
    where: {
      utilisateur_id_institution_id: {
        utilisateur_id: etudiantId,
        institution_id: institutionId
      }
    },
    data: {
      statut: newStatus,
      date_d_action: new Date()
    },
    include: {
      etudiant: true
    }
  });

  // 📩 Notification selon statut
  if (newStatus === "valide") {
    await creerNotification(
      etudiantId,
      "Votre demande d'inscription a été validée 🎉",
      TYPES_NOTIFICATION.VALIDATION_ETUDIANT_ACCEPTEE
    );
  }

  if (newStatus === "rejete") {
    await creerNotification(
      etudiantId,
      "Votre demande d'inscription a été refusée ❌",
      TYPES_NOTIFICATION.VALIDATION_ETUDIANT_REFUSEE
    );
  }

  return validation;
};