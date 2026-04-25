import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
    console.error('❌ ERREUR: DATABASE_URL est manquant dans backend/.env');
    console.error('👉 Ajoutez cette ligne dans backend/.env :');
    console.error('   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/appdb"');
    process.exit(1);
}

const prisma = new PrismaClient();

export default prisma;
