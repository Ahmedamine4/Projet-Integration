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
  if (!fs.existsSync(generatedSchemaPath)) {
    return true;
  }

  const sourceSchema = fs.readFileSync(schemaPath, 'utf8').replace(/\r\n/g, '\n').trim();
  const generatedSchema = fs.readFileSync(generatedSchemaPath, 'utf8').replace(/\r\n/g, '\n').trim();

  return sourceSchema !== generatedSchema;
}

function parseEnvFile(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((env, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) return env;

      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
      return env;
    }, {});
}

export default async function globalSetup() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema Prisma introuvable: ${schemaPath}`);
  }

  if (!fs.existsSync(prismaCliPath)) {
    throw new Error(`CLI Prisma introuvable: ${prismaCliPath}`);
  }

  const parsedEnv = fs.existsSync(envTestPath)
    ? parseEnvFile(fs.readFileSync(envTestPath, 'utf8'))
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
