import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');
const schemaPath = path.join(backendRoot, 'prisma', 'schema.prisma');
const envTestPath = path.join(backendRoot, '.env.test');
const prismaCliPath = path.join(backendRoot, 'node_modules', 'prisma', 'build', 'index.js');
const generatedSchemaPath = path.join(
  backendRoot,
  'node_modules',
  '.prisma',
  'client',
  'schema.prisma'
);

function shouldGenerateClient() {
  if (!fs.existsSync(generatedSchemaPath)) return true;
  const sourceSchema = fs.readFileSync(schemaPath, 'utf8').replace(/\r\n/g, '\n').trim();
  const generatedSchema = fs.readFileSync(generatedSchemaPath, 'utf8').replace(/\r\n/g, '\n').trim();
  return sourceSchema !== generatedSchema;
}

function hasGeneratedClient() {
  return fs.existsSync(path.join(backendRoot, 'node_modules', '.prisma', 'client', 'index.js'));
}

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  if (!fs.existsSync(envTestPath)) {
    throw new Error(`Fichier .env.test introuvable: ${envTestPath}`);
  }

  const content = fs.readFileSync(envTestPath, 'utf8');
  const match = content.match(/^DATABASE_URL\s*=\s*"?([^"\n\r]+)"?/m);
  if (!match) throw new Error('DATABASE_URL introuvable dans .env.test');

  return match[1].trim();
}

export default async function globalSetup() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema Prisma introuvable: ${schemaPath}`);
  }
  if (!fs.existsSync(prismaCliPath)) {
    throw new Error(`CLI Prisma introuvable: ${prismaCliPath}`);
  }

  const databaseUrl = loadDatabaseUrl();
  console.log(`✓ DATABASE_URL loaded: ${databaseUrl.substring(0, 50)}...`);

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    NODE_ENV: 'test',
  };

  if (shouldGenerateClient()) {
    try {
      execFileSync(
        process.execPath,
        [prismaCliPath, 'generate', '--schema', schemaPath],
        { cwd: backendRoot, env, stdio: 'inherit' }
      );
    } catch (error) {
      // Sous Windows, Prisma peut laisser le moteur verrouille si un precedent process
      // l'utilise encore. Si le client deja genere existe, on continue avec ce client.
      if (!hasGeneratedClient()) throw error;
      console.warn('Prisma generate a echoue, reutilisation du client deja genere.');
    }
  }

  execFileSync(
    process.execPath,
    [prismaCliPath, 'db', 'push', '--skip-generate', '--schema', schemaPath, '--accept-data-loss', '--force-reset'],
    { cwd: backendRoot, env, stdio: 'inherit' }
  );
}
