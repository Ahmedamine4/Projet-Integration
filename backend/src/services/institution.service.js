import prisma from '../config/prisma.js';

export const getInstitutions = async () => {
    return await prisma.institution.findMany({
        select: {
            institution_id: true,
            nom: true
        }
    });
}