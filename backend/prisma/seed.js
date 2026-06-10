import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Début du seed Prisma');

  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@exemple.com' },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'Test',
      email: 'admin@exemple.com',
      mot_de_passe: 'Admin123!',
      role: 'administrateur',
    },
  });

  const etudiant = await prisma.utilisateur.upsert({
    where: { email: 'etudiant@exemple.com' },
    update: {},
    create: {
      nom: 'Etudiant',
      prenom: 'Test',
      email: 'etudiant@exemple.com',
      role: 'etudiant',
      etudiant: {
        create: {
          promotion: '2026',
          niveau: 'Licence 3',
        },
      },
    },
  });

  const followExists = await prisma.follow.findFirst({
    where: {
      followerId: admin.utilisateur_id,
      followingId: etudiant.utilisateur_id,
    },
  });

  if (!followExists) {
    await prisma.follow.create({
      data: {
        followerId: admin.utilisateur_id,
        followingId: etudiant.utilisateur_id,
      },
    });
  }

  console.log('✅ Seed terminé');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
