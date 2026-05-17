import prisma from '../../src/config/prisma.js';

const TEST_INSTITUTION_DOMAIN = '@institution.integration.test';

export function assertInstitutionTestEnvironment() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL est obligatoire pour les tests d integration institution');
  }

  // Securite: ces tests ne doivent jamais viser une base hors test.
  if (!process.env.DATABASE_URL.includes('test')) {
    throw new Error(
      `DATABASE_URL doit viser une base de test. Valeur recue: ${process.env.DATABASE_URL}`
    );
  }
}

export function buildInstitutionPayload(prefix = 'institution') {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    nom: `Institution ${prefix} ${uniqueSuffix}`,
    email: `${prefix}.${uniqueSuffix}${TEST_INSTITUTION_DOMAIN}`,
    address: 'Campus test',
    description: 'Institution de test',
  };
}

export async function createInstitutionFixture(prefix = 'institution') {
  return prisma.institution.create({
    data: buildInstitutionPayload(prefix),
  });
}

export async function cleanupInstitutionFixtures() {
  await prisma.valideEtudiant.deleteMany({
    where: {
      institution: {
        email: {
          endsWith: TEST_INSTITUTION_DOMAIN,
        },
      },
    },
  });

  await prisma.institution.deleteMany({
    where: {
      email: {
        endsWith: TEST_INSTITUTION_DOMAIN,
      },
    },
  });
}
