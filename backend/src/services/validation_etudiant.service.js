import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';

// Recuperer les demandes en attente pour une institution specifique
export const getPendingValidations = async (institutionId) => {
    return await prisma.valideEtudiant.findMany({
        where: {
            institution_id: institutionId,
            statut: 'en_attente'
        },
        include: {
            etudiant: true
        }
    });
};

// Mettre a jour le statut (valide / refuse)
export const updateValidationStatus = async (
    etudiantId,
    institutionId,
    newStatus,
    options = {}
) => {
    const { utilisateurSourceId = null } = options;

    const updated = await prisma.valideEtudiant.update({
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
    });

    const message =
        newStatus === 'valide'
            ? "Votre demande de liaison a l'institution a ete acceptee."
            : "Votre demande de liaison a l'institution a ete refusee.";

    await creerNotification(
        etudiantId,
        message,
        'validation_institution',
        { utilisateurSourceId }
    );

    return updated;
};
