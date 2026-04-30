import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const LinkEtudiantToInstitution = async (etudiantId, filiereNom) => {
    const filiere = await prisma.filiere.findFirst({
        where: {nom: filiereNom}
    });
    if (!filiere) {
        throw new Error(`Filiere with name ${filiereNom} not found`);
    }
    return await prisma.etudiant.update({
        where: { etudiant_utilisateur_id: etudiantId },
        data: {
            filieres: { connect: { filiere_id: filiere.filiere_id } }
        },
        include: { filieres: true }
    })
}