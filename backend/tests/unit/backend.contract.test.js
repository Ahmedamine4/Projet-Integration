import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(path.join(backendRoot, relativePath), 'utf8');
}

function readSchema() {
  return fs.readFileSync(path.join(backendRoot, 'prisma/schema.prisma'), 'utf8');
}

function getModelFields(schema, modelName) {
  const match = schema.match(
    new RegExp(`model\\s+${modelName}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm')
  );

  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//') && !line.startsWith('@@'))
    .map((line) => line.split(/\s+/)[0]);
}

describe('backend contracts', () => {
  it('loggerSession n utilise que des champs presents dans le modele Connexion', () => {
    const schema = readSchema();
    const sessionService = read('src/services/session.service.js');
    const connexionFields = getModelFields(schema, 'Connexion');

    const createMatch = sessionService.match(
      /prisma\.connexion\.create\(\{\s*data:\s*\{([\s\S]*?)\n\s*\}\s*,?\s*\}\)/m
    );

    const usedKeys = [...createMatch[1].matchAll(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[:,]/gm)]
      .map((match) => match[1]);

    expect(usedKeys.every((key) => connexionFields.includes(key))).toBe(true);
  });

  it('la route portfolio privee reste protegee par authMiddleware', () => {
    const routesSource = read('src/routes/portfolio.routes.js');

    expect(routesSource).toContain(
      "router.get('/portfolio/:etudiantId', authMiddleware, getPortfolioEtudiantController);"
    );
  });

  it('les routes professeur sont montees dans app.js', () => {
    const appSource = read('src/app.js');

    expect(appSource).toContain('professeur.routes.js');
    expect(appSource).toMatch(/app\.use\([^)]*professeurRoutes[^)]*\)/);
  });

  it('professeur.controller ne caste pas experienceId en Number', () => {
    const controllerSource = read('src/controllers/professeur.controller.js');

    expect(controllerSource).not.toContain('Number(experienceId)');
  });
});
