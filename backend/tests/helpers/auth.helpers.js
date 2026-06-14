import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../src/config/prisma.js';

const TEST_PREFIX = 'test_auth_';
const TEST_EMAIL_DOMAIN = '@test.integration.local';

export function assertAuthTestEnvironment() {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Variable d'environnement manquante pour les tests : ${key}`);
    }
  }

  if (!process.env.DATABASE_URL.includes('test')) {
    throw new Error(
      `DATABASE_URL ne pointe pas vers une base de test : ${process.env.DATABASE_URL}`
    );
  }
}

export function buildRegisterPayload(suffix = 'default') {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    firstName: 'Integration',
    lastName: 'Tester',
    email: `${TEST_PREFIX}${suffix}.${uniqueSuffix}${TEST_EMAIL_DOMAIN}`,
    password: 'StrongPass123!',
  };
}

export function extractCookieValue(setCookieHeaders, name) {
  const cookies = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders].filter(Boolean);

  const rawCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!rawCookie) return null;

  return rawCookie.split(';')[0].split('=').slice(1).join('=');
}

export function buildAccessToken(user) {
  return jwt.sign(
    {
      id: user.utilisateur_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

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

export function signExpiredRefreshToken(user) {
  return jwt.sign(
    {
      id: user.utilisateur_id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '-1s' }
  );
}

export async function createLocalUserFixture(
  email,
  password = 'StrongPass123!',
  overrides = {}
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = overrides.role ?? 'etudiant';

  return prisma.$transaction(async (tx) => {
    const user = await tx.utilisateur.create({
      data: {
        nom: overrides.nom ?? 'NomTest',
        prenom: overrides.prenom ?? 'PrenomTest',
        email,
        mot_de_passe: hashedPassword,
        role,
        provider: overrides.provider ?? 'local',
      },
    });

    if (role === 'etudiant') {
      await tx.etudiant.create({
        data: {
          etudiant_utilisateur_id: user.utilisateur_id,
        },
      });
    }

    if (role === 'administrateur') {
      await tx.administrateur.create({
        data: {
          admin_utilisateur_id: user.utilisateur_id,
        },
      });
    }

    if (role === 'professeur') {
      await tx.professeur.create({
        data: {
          prof_utilisateur_id: user.utilisateur_id,
        },
      });
    }

    if (role === 'professionnel') {
      await tx.professionnel.create({
        data: {
          professionnel_utilisateur_id: user.utilisateur_id,
        },
      });
    }

    return user;
  });
}

export async function createAdminFixture(email) {
  return createLocalUserFixture(email, 'StrongPass123!', {
    role: 'administrateur',
    nom: 'Admin',
    prenom: 'Fixture',
  });
}

export async function createProfessorFixture(email) {
  return createLocalUserFixture(email, 'StrongPass123!', {
    role: 'professeur',
    nom: 'Prof',
    prenom: 'Fixture',
  });
}

export async function createProfessionalFixture(email) {
  return createLocalUserFixture(email, 'StrongPass123!', {
    role: 'professionnel',
    nom: 'Pro',
    prenom: 'Fixture',
  });
}

export async function cleanupAuthFixtures() {
  const testUsers = await prisma.utilisateur.findMany({
    where: {
      OR: [
        {
          email: {
            startsWith: TEST_PREFIX,
          },
        },
        {
          email: {
            endsWith: TEST_EMAIL_DOMAIN,
          },
        },
      ],
    },
    select: {
      utilisateur_id: true,
      role: true,
    },
  });

  if (testUsers.length === 0) return;

  const userIds = testUsers.map((user) => user.utilisateur_id);

  const studentIds = testUsers
    .filter((user) => user.role === 'etudiant')
    .map((user) => user.utilisateur_id);

  const professorIds = testUsers
    .filter((user) => user.role === 'professeur')
    .map((user) => user.utilisateur_id);

  const adminIds = testUsers
    .filter((user) => user.role === 'administrateur')
    .map((user) => user.utilisateur_id);

  const professionalIds = testUsers
    .filter((user) => user.role === 'professionnel')
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

  await prisma.notification.deleteMany({
    where: {
      OR: [
        {
          utilisateur_cible_id: {
            in: userIds,
          },
        },
        {
          utilisateur_source_id: {
            in: userIds,
          },
        },
      ],
    },
  });

  await prisma.connexion.deleteMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
  });

  await prisma.follow.deleteMany({
    where: {
      OR: [
        {
          followerId: {
            in: userIds,
          },
        },
        {
          followingId: {
            in: userIds,
          },
        },
      ],
    },
  });

  await prisma.lettresDeRecommendations.deleteMany({
    where: {
      OR: [
        {
          utilisateur_id: {
            in: userIds,
          },
        },
        {
          prof_utilisateur_id: {
            in: userIds,
          },
        },
      ],
    },
  });

  await prisma.valideEtudiant.deleteMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
  });

  if (experienceIds.length > 0) {
    await prisma.valideStage.deleteMany({
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

    await prisma.valideActivite.deleteMany({
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
            utilisateur_id: {
              in: userIds,
            },
          },
          {
            experience_id: {
              in: experienceIds,
            },
          },
        ],
      },
    });

    await prisma.$executeRawUnsafe(`
      DELETE FROM "_ActiviteToClub"
      WHERE "A" IN (${experienceIds.map((id) => `'${id}'`).join(',') || "''"})
    `);

    await prisma.competenceDeveloppee.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
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

    await prisma.experience.deleteMany({
      where: {
        experience_id: {
          in: experienceIds,
        },
      },
    });
  }

  await prisma.interaction.deleteMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
  });

  const portfolios = await prisma.portfolio.findMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
    select: {
      portfolio_id: true,
    },
  });

  const portfolioIds = portfolios.map((portfolio) => portfolio.portfolio_id);

  if (portfolioIds.length > 0) {
    await prisma.interaction.deleteMany({
      where: {
        portfolio_id: {
          in: portfolioIds,
        },
      },
    });

    await prisma.portfolioScoreHistory.deleteMany({
      where: {
        portfolio_id: {
          in: portfolioIds,
        },
      },
    });

    await prisma.portfolio.deleteMany({
      where: {
        portfolio_id: {
          in: portfolioIds,
        },
      },
    });
  }

  await prisma.repository.deleteMany({
    where: {
      etudiant_id: {
        in: userIds,
      },
    },
  });

  await prisma.professionnel.deleteMany({
    where: {
      professionnel_utilisateur_id: {
        in: professionalIds,
      },
    },
  });

  await prisma.administrateur.deleteMany({
    where: {
      admin_utilisateur_id: {
        in: adminIds,
      },
    },
  });

  await prisma.professeur.deleteMany({
    where: {
      prof_utilisateur_id: {
        in: professorIds,
      },
    },
  });

  await prisma.etudiant.deleteMany({
    where: {
      etudiant_utilisateur_id: {
        in: studentIds,
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
