// Helper simple: on verifie juste que la base cible ressemble bien a une base de test.
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
