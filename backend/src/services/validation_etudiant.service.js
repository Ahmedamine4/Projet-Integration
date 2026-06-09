import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';

<<<<<<< Updated upstream
// Recuperer les demandes en attente pour une institution specifique
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// Mettre a jour le statut (valide / refuse)
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            date: new Date(),
        },
    });

=======
            date: new Date()
        }
    });

    const type =
        newStatus === 'valide'
            ? 'validation_etudiant_acceptee'
            : 'validation_etudiant_refusee';

>>>>>>> Stashed changes
    const message =
        newStatus === 'valide'
            ? "Votre demande de liaison a l'institution a ete acceptee."
            : "Votre demande de liaison a l'institution a ete refusee.";

    await creerNotification(
        etudiantId,
        message,
<<<<<<< Updated upstream
        'validation_institution',
=======
        type,
>>>>>>> Stashed changes
        { utilisateurSourceId }
    );

    return updated;
};
