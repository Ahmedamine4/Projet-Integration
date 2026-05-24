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
  const users = await prisma.utilisateur.findMany({
    where: {
      email: {
        endsWith: TEST_EMAIL_DOMAIN,
      },
    },
    select: {
      utilisateur_id: true,
      role: true,
    },
  });

  if (users.length === 0) {
    return;
  }

  const userIds = users.map((user) => user.utilisateur_id);
  const studentIds = users
    .filter((user) => user.role === 'etudiant')
    .map((user) => user.utilisateur_id);
  const professorIds = users
    .filter((user) => user.role === 'professeur')
    .map((user) => user.utilisateur_id);

  const experiences = await prisma.experience.findMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
    select: {
      experience_id: true,
    },
  });

  const experienceIds = experiences.map((experience) => experience.experience_id);

  if (experienceIds.length > 0) {
    await prisma.valideActivite.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.valideProjet.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.valideStage.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.valideCertification.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.documentation.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.interaction.deleteMany({
      where: {
        OR: [
          {
            experience_id: {
              in: experienceIds,
            },
          },
          {
            utilisateur_id: {
              in: userIds,
            },
          },
        ],
      },
    });

    await prisma.certification.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.projet.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.stage.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.activite.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });

    await prisma.$executeRawUnsafe(`
      DELETE FROM "_CompetenceToExperience"
      WHERE "B" IN (
        SELECT "experience_id"
        FROM "experiences"
        WHERE "utilisateur_id" IN (
          SELECT "utilisateur_id"
          FROM "utilisateurs"
          WHERE "email" LIKE '%${TEST_EMAIL_DOMAIN}'
        )
      )
    `);

    await prisma.$executeRawUnsafe(`
      DELETE FROM "_ActiviteToClub"
      WHERE "A" IN (
        SELECT "experience_id"
        FROM "activites"
        WHERE "experience_id" IN (
          SELECT "experience_id"
          FROM "experiences"
          WHERE "utilisateur_id" IN (
            SELECT "utilisateur_id"
            FROM "utilisateurs"
            WHERE "email" LIKE '%${TEST_EMAIL_DOMAIN}'
          )
        )
      )
    `);

    await prisma.experience.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });
  } else {
    await prisma.interaction.deleteMany({
      where: {
        utilisateur_id: {
          in: userIds,
        },
      },
    });
  }

  await prisma.competence.deleteMany({
    where: {
      experiences: {
        none: {},
      },
    },
  });

  await prisma.lettresDeRecommendations.deleteMany({
    where: {
      OR: [
        {
          utilisateur_id: {
            in: studentIds,
          },
        },
        {
          prof_utilisateur_id: {
            in: professorIds,
          },
        },
      ],
    },
  });

  await prisma.valideEtudiant.deleteMany({
    where: {
      utilisateur_id: {
        in: studentIds,
      },
    },
  });

  await prisma.portfolio.deleteMany({
    where: {
      utilisateur_id: {
        in: studentIds,
      },
    },
  });

  await prisma.notification.deleteMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
  });

  await prisma.connexion.deleteMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
  });

<<<<<<< HEAD
=======
  await prisma.repository.deleteMany({
    where: {
      etudiant_id: {
        in: studentIds,
      },
    },
  });

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
  await prisma.directeur.deleteMany({
    where: {
      directeur_utilisateur_id: {
        in: userIds,
      },
    },
  });

  await prisma.professionnel.deleteMany({
    where: {
      professionnel_utilisateur_id: {
        in: userIds,
      },
    },
  });

  await prisma.administrateur.deleteMany({
    where: {
      admin_utilisateur_id: {
        in: userIds,
      },
    },
  });

  await prisma.professeur.deleteMany({
    where: {
      prof_utilisateur_id: {
        in: userIds,
      },
    },
  });

  await prisma.etudiant.deleteMany({
    where: {
      etudiant_utilisateur_id: {
        in: userIds,
      },
    },
  });

  await prisma.utilisateur.deleteMany({
    where: {
      utilisateur_id: {
        in: userIds,
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

export async function createAdminFixture(email) {
  const userId = randomUUID();

  await prisma.$executeRaw`
    INSERT INTO utilisateurs (utilisateur_id, nom, prenom, role, email, mot_de_passe, provider, date_de_creation)
    VALUES (${userId}, ${'Admin'}, ${'Fixture'}, CAST(${'administrateur'} AS "RoleUtilisateur"), ${email}, ${'hashed-password'}, ${'local'}, NOW())
  `;

  await prisma.$executeRaw`
    INSERT INTO administrateurs (admin_utilisateur_id)
    VALUES (${userId})
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
    },
  });
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

  if (role === 'etudiant') {
    await prisma.$executeRaw`
      INSERT INTO etudiants (etudiant_utilisateur_id)
      VALUES (${userId})
    `;
  }

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
