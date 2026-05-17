import prisma from '../config/prisma.js';

export const getInstitutions = async () => {
    return await prisma.institution.findMany({
        select: {
            nom: true
        }
    });
}