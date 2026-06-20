import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// "vi" est l'outil de mock fourni par Vitest.
// Il permet de remplacer une vraie dependance par une fausse fonction.
// Mock du service institution pour tester seulement la route et le controller.
vi.mock('../../src/services/institution.service.js', () => ({
  // Cette fonction sera pilotee dans chaque test.
  getInstitutions: vi.fn(),
}));

// Ici, getInstitutions est la version mockee du service.
import { getInstitutions } from '../../src/services/institution.service.js';
// Ici, on importe le vrai routeur Express a tester.
import institutionRouter from '../../src/routes/institution.routes.js';

// Cette suite teste la route institution avec un petit serveur Express de test.
// On utilise le vrai routeur, mais le service reste mocke.
describe('institution routes', () => {
  // app represente une petite application Express uniquement pour les tests.
  let app;

  beforeEach(() => {
    // On nettoie les mocks puis on reconstruit l'application de test.
    vi.clearAllMocks();

    // Cette petite application Express sert uniquement au test.
    app = express();
    // Ce middleware permet de lire du JSON dans les requetes.
    app.use(express.json());
    // On branche le vrai routeur institution sur /institutions.
    app.use('/institutions', institutionRouter);
  });

  it('GET /institutions retourne 200 avec la liste des institutions', async () => {
    // On teste le parcours HTTP de la route institution.
    // Le mock dit ici : le service renvoie une liste correcte.
    getInstitutions.mockResolvedValue([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);

    // request(app).get(...) simule un appel HTTP GET vers la route.
    const response = await request(app).get('/institutions');

    // On verifie le code HTTP renvoye.
    expect(response.status).toBe(200);
    // On verifie les donnees JSON renvoyees.
    expect(response.body).toEqual([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);
  });

  it('GET /institutions retourne 500 si le service echoue', async () => {
    // Si le service tombe en erreur, la route renvoie 500.
    // On masque console.error pendant le test pour garder une sortie propre.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Cette ligne simule une erreur provenant du service.
    getInstitutions.mockRejectedValue(new Error('db error'));

    const response = await request(app).get('/institutions');

    // 500 signifie erreur interne du serveur.
    expect(response.status).toBe(500);
    // Le controller renvoie un message JSON simple d'erreur.
    expect(response.body).toEqual({
      error: 'Internal server error',
    });

    // On remet console.error dans son etat normal.
    consoleSpy.mockRestore();
  });
});
