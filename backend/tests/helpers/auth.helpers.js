// jwt sert a signer des tokens expirés ou de test.
import jwt from 'jsonwebtoken';
// Prisma reel est utilise ici pour nettoyer et preparer la base de test.
import prisma from '../../src/config/prisma.js';
// bcrypt sert a hasher un mot de passe de fixture locale.
import bcrypt from 'bcryptjs';
// randomUUID sert a creer des identifiants uniques pour les fixtures SQL.
import { randomUUID } from 'node:crypto';

// Tous les utilisateurs crees par ces tests auront ce domaine special.
const TEST_EMAIL_DOMAIN = '@integration.test';

// Cette fonction verifie que l'environnement de test auth est bien pret.
export function assertAuthTestEnvironment() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL est obligatoire pour les tests d integration auth');
  }

  // Securite importante: on refuse de nettoyer une base qui ne ressemble pas a une base de test.
  if (!process.env.DATABASE_URL.includes('test')) {
    throw new Error(
      `DATABASE_URL doit viser une base de test. Valeur recue: ${process.env.DATABASE_URL}`
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET est obligatoire pour les tests d integration auth');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET est obligatoire pour les tests d integration auth');
  }
}

// Construit un payload realiste pour la route register actuelle.
export function buildRegisterPayload(prefix = 'auth') {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    firstName: 'Integration',
    lastName: 'Tester',
    email: `${prefix}.${uniqueSuffix}${TEST_EMAIL_DOMAIN}`,
    password: 'StrongPass123!',
    // On envoie volontairement un role admin pour verifier que le backend l'ignore.
    role: 'administrateur',
  };
}

// Extrait une valeur de cookie depuis l'en-tete Set-Cookie renvoye par Express.
export function extractCookieValue(setCookieHeaders, cookieName) {
  const cookies = setCookieHeaders || [];
  const rawCookie = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));

  if (!rawCookie) {
    return null;
  }

  return rawCookie.split(';')[0].split('=').slice(1).join('=');
}

// Genere un access token deja expire pour tester le refus du middleware.
export function signExpiredAccessToken(user) {
  return jwt.sign(
    {
      id: user.utilisateur_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '-1s' }
  );
}

// Genere un refresh token deja expire pour tester la route /refresh-token.
export function signExpiredRefreshToken(user) {
  return jwt.sign(
    { id: user.utilisateur_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '-1s' }
  );
}

// Nettoyage de la base apres ou avant les tests.
// On supprime seulement les donnees dont l'email finit par @integration.test.
export async function cleanupAuthFixtures() {
  await prisma.professeur.deleteMany({
    where: {
      utilisateur: {
        email: {
          endsWith: TEST_EMAIL_DOMAIN,
        },
      },
    },
  });

  await prisma.utilisateur.deleteMany({
    where: {
      email: {
        endsWith: TEST_EMAIL_DOMAIN,
      },
    },
  });
}

// Cree une fixture professeur reelle en base.
// On passe ici par du SQL brut pour contourner le probleme Prisma actuel sur refresh_token.
export async function createProfessorFixture(email) {
  const userId = randomUUID();

  await prisma.$executeRaw`
    INSERT INTO utilisateurs (utilisateur_id, nom, prenom, role, email, mot_de_passe, provider, date_de_creation)
    VALUES (${userId}, ${'Prof'}, ${'Fixture'}, CAST(${'professeur'} AS "RoleUtilisateur"), ${email}, ${'hashed-password'}, ${'local'}, NOW())
  `;

  await prisma.$executeRaw`
    INSERT INTO professeurs (prof_utilisateur_id)
    VALUES (${userId})
  `;

  const user = await prisma.utilisateur.findUnique({
    where: { email },
    select: {
      utilisateur_id: true,
      email: true,
      nom: true,
      prenom: true,
      role: true,
      provider: true,
    },
  });

  return user;
}

// Cree une fixture utilisateur locale reelle.
// Le role reste paramétrable pour couvrir aussi les routes admin.
export async function createLocalUserFixture(
  email,
  password = 'StrongPass123!',
  options = {}
) {
  const {
    role = 'etudiant',
    nom = 'Local',
    prenom = 'Fixture',
    provider = 'local',
  } = options;
  const userId = randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.$executeRaw`
    INSERT INTO utilisateurs (utilisateur_id, nom, prenom, role, email, mot_de_passe, provider, date_de_creation)
    VALUES (${userId}, ${nom}, ${prenom}, CAST(${role} AS "RoleUtilisateur"), ${email}, ${hashedPassword}, ${provider}, NOW())
  `;

  return prisma.utilisateur.findUnique({
    where: { email },
    select: {
      utilisateur_id: true,
      email: true,
      nom: true,
      prenom: true,
      role: true,
      provider: true,
      mot_de_passe: true,
    },
  });
}
