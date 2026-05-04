import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR: DATABASE_URL est manquant dans .env');
  process.exit(1);
}

const prisma = new PrismaClient();
export default prisma;