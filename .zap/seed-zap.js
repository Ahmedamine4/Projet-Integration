import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('⏳ Seeding ZAP test user...');
  const hash = await bcrypt.hash('ZapScanner123!', 10);
  
  await prisma.utilisateur.upsert({
    where: { email: 'zap-scanner@test.com' },
    update: {},
    create: {
      nom: 'ZAP',
      prenom: 'Scanner',
      email: 'zap-scanner@test.com',
      mot_de_passe: hash,
      role: 'etudiant',
      provider: 'local',
      etudiant: { create: {} }
    }
  });
  
  console.log('✅ ZAP Scanner user seeded successfully.');
}

seed()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });