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
  const candidates = ['prisma/schema.prisma', 'prisma copy/schema.prisma'];

  for (const candidate of candidates) {
    const fullPath = path.join(backendRoot, candidate);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
  }

  throw new Error('schema.prisma introuvable dans le backend');
}

function getModelFields(schema, modelName) {
  const match = schema.match(
    new RegExp(`model\\s+${modelName}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm')
  );

  if (!match) {
    throw new Error(`Model ${modelName} introuvable dans schema.prisma`);
  }

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

    expect(createMatch).not.toBeNull();

    const usedKeys = [...createMatch[1].matchAll(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[:,]/gm)]
      .map((match) => match[1]);

    expect(usedKeys.every((key) => connexionFields.includes(key))).toBe(true);
  });

  it('la route portfolio publique ne doit pas dereferencer req.user sans garde', () => {
    const routesSource = read('src/routes/portfolio.routes.js');
    const controllerSource = read('src/controllers/portfolio.controller.js');

    expect(routesSource).toContain("router.get('/portfolio/:etudiantId', authMiddleware, getPortfolioEtudiantController);");
    expect(controllerSource).toContain('const isOwner = req.user.utilisateur_id === etudiantId;');
  });

  it('les routes professeur doivent etre montees dans app.js', () => {
    const appSource = read('src/app.js');

    expect(appSource).toContain('professeur.routes.js');
    expect(appSource).toMatch(/app\.use\([^)]*professeurRoutes[^)]*\)/);
  });

  it('ValideProjet.controller ne doit pas caster experience_id en Number quand Prisma attend String', () => {
    const schema = readSchema();
    const controllerSource = read('src/controllers/ValideProjet.controller.js');

    const fieldTypeMatch = schema.match(/model\s+ValideProjet[\s\S]*?experience_id\s+(\w+)/);

    expect(fieldTypeMatch?.[1]).toBe('String');
    expect(controllerSource).not.toContain('Number(id)');
  });

  it('stage.service ne doit pas lire ou ecrire des champs absents du modele Stage', () => {
    const schema = readSchema();
    const stageService = read('src/services/stage.service.js');
    const stageFields = getModelFields(schema, 'Stage');

    const referencedStageFields = ['date_fin', 'duree', 'missions_realisees', 'rapport_stage']
      .filter((field) => stageService.includes(field));

    expect(stageFields).toEqual(
      expect.arrayContaining(['experience_id', 'duree', 'missions_realisees', 'rapport_stage'])
    );
    expect(referencedStageFields.every((field) => stageFields.includes(field))).toBe(true);
  });
});
