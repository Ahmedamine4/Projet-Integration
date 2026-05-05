import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
    return await prisma.valideEtudiant.update({
        where: {
            // Utilisation de la clé composée utilisateur_id_institution_id
            utilisateur_id_institution_id: {
                utilisateur_id: etudiantId,
                institution_id: institutionId
            }
        },
        data: {
            statut: newStatus,
            date_d_action: new Date()
        }
    });
};