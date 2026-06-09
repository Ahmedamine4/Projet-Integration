import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';

export const LinkInstitutionsToEtudiant = async (etudiantId, institutionId) => {
    const institutions = await prisma.institution.findMany({
        where: {
            institution_id: { in: institutionId }
        },
        select: { nom: true, institution_id: true }
    });

    if (institutions.length === 0) {
        throw new Error("Aucune institution trouvÃ©e avec les noms fournis.");
    }

    const existingLinks = await prisma.valideEtudiant.findMany({
        where: {
            utilisateur_id: etudiantId,
            institution_id: { in: institutions.map((inst) => inst.institution_id) }
        },
        select: { institution_id: true }
    });
    const existingInstitutionIds = new Set(existingLinks.map((link) => link.institution_id));

    const records = await Promise.all(
        institutions.map(inst =>
            prisma.valideEtudiant.upsert({
                where: {
                    utilisateur_id_institution_id: {
                        utilisateur_id: etudiantId,
                        institution_id: inst.institution_id
                    }
                },
                update: {},
                create: {
                    utilisateur_id: etudiantId,
                    institution_id: inst.institution_id,
                    statut: 'en_attente',
                    date: new Date()
                }
            })
        )
    );

    for (const institution of institutions) {
        if (existingInstitutionIds.has(institution.institution_id)) {
            continue;
        }

        await creerNotification(
            etudiantId,
            `Votre demande de liaison a l'institution "${institution.nom}" a ete envoyee.`,
            'institution_demande_envoyee',
            { utilisateurSourceId: etudiantId }
        );
    }

    return records;
};
