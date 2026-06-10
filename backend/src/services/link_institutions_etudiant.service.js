import prisma from '../config/prisma.js';

export const LinkInstitutionsToEtudiant = async (etudiantId, institutionId) => {
    // 1. Trouver les institutions correspondantes
    const institutions = await prisma.institution.findMany({
        where: { 
            institution_id: { in: institutionId }
        },
        select: { nom: true, institution_id: true }
    });

    if (institutions.length === 0) {
        throw new Error("Aucune institution trouvée avec les noms fournis.");
    }

    // 2. Création sécurisée (évite les crashs si le lien existe déjà)
    const records = await Promise.all(
        institutions.map(inst => 
            prisma.valideEtudiant.upsert({
                where: {
                    // Vérifie le nom exact de ta contrainte unique dans schema.prisma
                    utilisateur_id_institution_id: {
                        utilisateur_id: etudiantId,
                        institution_id: inst.institution_id
                    }
                },
                update: {}, // Ne rien changer si ça existe déjà
                create: {
                    utilisateur_id: etudiantId,
                    institution_id: inst.institution_id,
                    statut: 'en_attente',
                    date: new Date()
                }
            })
        )
    );

    return records;
};
