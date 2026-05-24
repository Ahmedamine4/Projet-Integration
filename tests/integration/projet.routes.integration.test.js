import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it,vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
<<<<<<< HEAD
=======
import { supabase } from '../../src/config/supabase.js';
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
import {
  assertAuthTestEnvironment,
  buildRegisterPayload,
  cleanupAuthFixtures,
<<<<<<< HEAD
  createLocalUserFixture,
} from '../helpers/auth.helpers.js';

const supabaseBucketMock = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
};

const supabaseMock = {
  storage: {
    from: vi.fn(() => supabaseBucketMock),
  },
};

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
=======
  createAdminFixture,
  createLocalUserFixture,
} from '../helpers/auth.helpers.js';
vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    storage: {
      from:( () => ({ 
        upmoad: vi.fn(async () => ({ 
          data:{path:'projets/test-image.png'},
          error: null 
        })),
        getPublicUrl: vi.fn( async () => ({
          data: {
            publicUrl: `https://cdn.integration.test/projets/test-image.png`,
          },
        })),
         })),
    },
  },

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
}));

const { default: app } = await import('../../src/app.js');

function buildAccessToken(user) {
  return jwt.sign(
    {
      id: user.utilisateur_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('Projet integration', () => {
<<<<<<< HEAD
=======
  const originalStorage = supabase.storage;

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
  beforeAll(async () => {
    assertAuthTestEnvironment();
    await prisma.$connect();
  });

  beforeEach(async () => {
<<<<<<< HEAD
    vi.clearAllMocks();
    supabaseMock.storage.from.mockReturnValue(supabaseBucketMock);
    supabaseBucketMock.upload.mockResolvedValue({
      data: { path: 'projets/test-image.png' },
      error: null,
    });
    supabaseBucketMock.getPublicUrl.mockReturnValue({
      data: {
        publicUrl: 'https://cdn.integration.test/projets/test-image.png',
      },
    });
=======
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
    await cleanupAuthFixtures();
  });

  afterAll(async () => {
    await cleanupAuthFixtures();
<<<<<<< HEAD
=======
    supabase.storage = originalStorage;
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
    await prisma.$disconnect();
  });

  it('POST /api/add-projet retourne 400 si des champs obligatoires manquent', async () => {
    const payload = buildRegisterPayload('projet-missing');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet seul',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Champs obligatoires manquants',
    });
  });

<<<<<<< HEAD
=======
  it('POST /api/add-projet retourne 403 pour un role non autorise', async () => {
    const admin = await createAdminFixture(`projet.admin.${Date.now()}@integration.test`);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({
        projectTitle: 'Projet admin',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: true,
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
  it('POST /api/add-projet retourne 400 pour un projet academique sans professeur', async () => {
    const payload = buildRegisterPayload('projet-academique');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet academique',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'false',
        projetType: 'academique',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('professeur');
  });

  it('POST /api/add-projet cree un projet simple et retourne des donnees metier coherentes', async () => {
    const payload = buildRegisterPayload('projet-success');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet simple',
        projectDate: '2026-05-09',
        description: 'Description simple',
        visibleToEveryone: true,
        technologies: '["Node.js"]',
        domains: '["Web"]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience).toMatchObject({
      titre: 'Projet simple',
      utilisateur_id: user.utilisateur_id,
      visibilite: true,
    });
    expect(response.body.data.projet).toMatchObject({
      technologies: ['Node.js'],
      domains: ['Web'],
    });
  });

  it('POST /api/add-projet persiste visibleToEveryone=false', async () => {
    const payload = buildRegisterPayload('projet-false');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const projectTitle = `Projet prive ${Date.now()}`;

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle,
        projectDate: '2026-05-11',
        description: 'Description privee',
        visibleToEveryone: false,
        technologies: '[]',
        domains: '[]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience.visibilite).toBe(false);

    const persisted = await prisma.experience.findFirst({
      where: { utilisateur_id: user.utilisateur_id, titre: projectTitle },
      select: { visibilite: true },
    });

    expect(persisted.visibilite).toBe(false);
  });

  it('POST /api/add-projet convertit visibleToEveryone=\"true\" en boolean true', async () => {
    const payload = buildRegisterPayload('projet-string-true');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const projectTitle = `Projet string true ${Date.now()}`;

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle,
        projectDate: '2026-05-12',
        description: 'Description',
        visibleToEveryone: 'true',
        technologies: '[]',
        domains: '[]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience.visibilite).toBe(true);

    const persisted = await prisma.experience.findFirst({
      where: { utilisateur_id: user.utilisateur_id, titre: projectTitle },
      select: { visibilite: true },
    });

    expect(persisted.visibilite).toBe(true);
  });

  it('POST /api/add-projet convertit visibleToEveryone=\"false\" en boolean false', async () => {
    const payload = buildRegisterPayload('projet-string-false');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const projectTitle = `Projet string false ${Date.now()}`;

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle,
        projectDate: '2026-05-13',
        description: 'Description',
        visibleToEveryone: 'false',
        technologies: '[]',
        domains: '[]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience.visibilite).toBe(false);

    const persisted = await prisma.experience.findFirst({
      where: { utilisateur_id: user.utilisateur_id, titre: projectTitle },
      select: { visibilite: true },
    });

    expect(persisted.visibilite).toBe(false);
  });

  it('POST /api/add-projet retourne 400 si visibleToEveryone est absent', async () => {
    const payload = buildRegisterPayload('projet-missing-visibility');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet sans visibilite',
        projectDate: '2026-05-14',
        description: 'Description',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Champs obligatoires manquants');
  });

  it('POST /api/add-projet retourne 500 si le professeur academique est introuvable', async () => {
    const payload = buildRegisterPayload('projet-missing-prof-http');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet academique sans vrai prof',
        projectDate: '2026-05-15',
        description: 'Description',
        visibleToEveryone: false,
        projetType: 'academique',
        professorEmail: `missing.project.prof.${Date.now()}@integration.test`,
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Professeur non trouv');
  });

  it('POST /api/add-projet upload une image et persiste son URL publique', async () => {
    const payload = buildRegisterPayload('projet-upload');
    const user = await createLocalUserFixture(payload.email, payload.password);
<<<<<<< HEAD
    supabaseBucketMock.upload.mockResolvedValue({ error: null });
    supabaseBucketMock.getPublicUrl.mockImplementation((fileName) => ({
      data: {
        publicUrl: `https://cdn.integration.test/projets/${fileName}`,
      },
    }));
=======
        supabase.storage = {
      from: () => ({
        upload: vi.fn(async () => ({ error: null })),
        getPublicUrl: vi.fn((fileName) => ({
          data: {
            publicUrl: `https://cdn.integration.test/projets/${fileName}`,
          },
        })),
      }),
    };
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .field('projectTitle', `Projet image ${Date.now()}`)
      .field('projectDate', '2026-05-16')
      .field('description', 'Projet avec image')
      .field('visibleToEveryone', 'true')
      .field('technologies', '["Node.js"]')
      .field('domains', '["Web"]')
      .attach('img', Buffer.from('fake image content'), {
        filename: 'projet-test.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(201);
<<<<<<< HEAD
=======
    console.log(response.status, response.body);//aussi pour voir l erreur exact
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
    expect(response.body.success).toBe(true);
    expect(response.body.data.projet.photo).toContain('https://cdn.integration.test/projets/');
  });
});
