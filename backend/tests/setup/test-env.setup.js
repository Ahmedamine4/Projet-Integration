import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');
const testEnvPath = path.join(backendRoot, '.env.test');

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

process.env.NODE_ENV = 'test';

if (fs.existsSync(testEnvPath)) {
  const parsedEnv = parseEnvFile(fs.readFileSync(testEnvPath, 'utf8'));

  for (const [key, value] of Object.entries(parsedEnv)) {
    process.env[key] = value;
  }
}

if (!process.env.MY_EXPRESS_SECRET && process.env.JWT_SECRET) {
  process.env.MY_EXPRESS_SECRET = process.env.JWT_SECRET;
}

if (!process.env.JWT_SECRET && process.env.MY_EXPRESS_SECRET) {
  process.env.JWT_SECRET = process.env.MY_EXPRESS_SECRET;
}

if (!process.env.JWT_EXPIRES && process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES = process.env.JWT_EXPIRES_IN;
}

if (!process.env.JWT_EXPIRES_IN && process.env.JWT_EXPIRES) {
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES;
}

if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'integration_refresh_secret';
}

if (!process.env.JWT_REFRESH_EXPIRES_IN) {
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
}

if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
}

if (!process.env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
}

if (!process.env.SUPABASE_JWT_SECRET) {
  process.env.SUPABASE_JWT_SECRET = 'integration_supabase_secret';
}
