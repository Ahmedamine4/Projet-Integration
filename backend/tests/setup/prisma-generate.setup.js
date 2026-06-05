import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

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
  if (!fs.existsSync(generatedSchemaPath)) {
    return true;
  }

  const sourceSchema = fs.readFileSync(schemaPath, 'utf8').replace(/\r\n/g, '\n').trim();
  const generatedSchema = fs.readFileSync(generatedSchemaPath, 'utf8').replace(/\r\n/g, '\n').trim();

  return sourceSchema !== generatedSchema;
}

export default async function globalSetup() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema Prisma introuvable: ${schemaPath}`);
  }

  if (!fs.existsSync(prismaCliPath)) {
    throw new Error(`CLI Prisma introuvable: ${prismaCliPath}`);
  }

  const parsedEnv = fs.existsSync(envTestPath)
    ? dotenv.parse(fs.readFileSync(envTestPath))
    : {};

  const env = {
    ...process.env,
    ...parsedEnv,
    NODE_ENV: 'test',
  };

  if (shouldGenerateClient()) {
    execFileSync(
      process.execPath,
      [prismaCliPath, 'generate', '--schema', schemaPath],
      {
        cwd: backendRoot,
        env,
        stdio: 'inherit',
      }
    );
  }
}
