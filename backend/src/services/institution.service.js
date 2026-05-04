import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getInstitutions = async () => {
    return await prisma.institution.findMany({
        select: {
            nom: true
        }
    });
}