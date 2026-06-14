import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  experience: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  stage: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

const txMock = {
  experience: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  stage: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  utilisateur: {
    findUnique: vi.fn(),
  },
  valideStage: {
    create: vi.fn(),
    update: vi.fn(),
  },
};

const creerNotificationMock = vi.fn();
const lierCompetencesExperienceMock = vi.fn();
const supprimerCompetencesDeveloppeesMock = vi.fn();
const getCompetencesByExperienceMock = vi.fn();

const photoUtilsMock = {
  uploadPhoto: vi.fn(),
  remplacerPhoto: vi.fn(),
  supprimerPhoto: vi.fn(),
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: creerNotificationMock,
  TYPES_NOTIFICATION: {
    VALIDATION_STAGE: 'validation_stage',
  },
}));

vi.mock('../../src/services/competence.helper.js', () => ({
  lierCompetencesExperience: lierCompetencesExperienceMock,
  supprimerCompetencesDeveloppees: supprimerCompetencesDeveloppeesMock,
  getCompetencesByExperience: getCompetencesByExperienceMock,
}));

vi.mock('../../src/utils/photo.utils.js', () => photoUtilsMock);

const stageService = await import('../../src/services/stage.service.js');

describe('stage.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

    prismaMock.experience.findFirst.mockResolvedValue(null);
    prismaMock.experience.findMany.mockResolvedValue([]);
    prismaMock.experience.update.mockResolvedValue({});

    prismaMock.stage.findMany.mockResolvedValue([]);
    prismaMock.stage.findUnique.mockResolvedValue(null);

    txMock.stage.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      duree: '9',
      experience: {
        experience_id: 'exp-1',
        titre: 'Stage backend',
        visibilite: false,
        type: 'stage',
        type_specifique: 'academique',
        utilisateur_id: 'etu-1',
        competence_dev: [],
      },
      validation: {
        statut: 'en_attente',
      },
    });

    photoUtilsMock.uploadPhoto.mockResolvedValue('https://cdn.example.com/photo.png');
    photoUtilsMock.remplacerPhoto.mockResolvedValue('https://cdn.example.com/new-photo.png');
    photoUtilsMock.supprimerPhoto.mockResolvedValue(undefined);

    lierCompetencesExperienceMock.mockReset();
    lierCompetencesExperienceMock
      .mockResolvedValueOnce([{ competence_id: 'tech-1' }])
      .mockResolvedValueOnce([{ competence_id: 'dom-1' }]);

    supprimerCompetencesDeveloppeesMock.mockResolvedValue(undefined);
    getCompetencesByExperienceMock.mockResolvedValue({ technologies: [], domaines: [] });
  });

  it('creeStage cree un stage invisible avec competences et validation', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Stage backend',
    });

    txMock.stage.create.mockResolvedValue({
      experience_id: 'exp-1',
      duree: '9',
    });

    txMock.stage.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      duree: '9',
      experience: {
        experience_id: 'exp-1',
        titre: 'Stage backend',
        visibilite: false,
        type: 'stage',
        type_specifique: 'academique',
        utilisateur_id: 'etu-1',
        competence_dev: [],
      },
      validation: {
        statut: 'en_attente',
      },
    });

    txMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-1',
        email: 'prof@example.com',
        professeur: { prof_utilisateur_id: 'prof-1' },
      })
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        nom: 'Doe',
        prenom: 'Jane',
      });

    txMock.valideStage.create.mockResolvedValue({
      experience_id: 'exp-1',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
    });

    const result = await stageService.creeStage(
      'etu-1',
      {
        titre: 'Stage backend',
        description: 'API interne',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        missions_realisees: 'Developpement API',
        rapport_stage: 'https://cdn.example.com/rapport.pdf',
        technologies: '["Node.js","Express"]',
        domaines: '["Web"]',
        is_academique: 'true',
        email_professeur: 'prof@example.com',
      },
      {
        originalname: 'photo.png',
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      }
    );

    expect(photoUtilsMock.uploadPhoto).toHaveBeenCalled();

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'prof-1',
      expect.stringContaining('Stage backend'),
      'validation_stage'
    );

    expect(lierCompetencesExperienceMock).toHaveBeenCalledTimes(2);

    expect(result).toMatchObject({
      experience_id: 'exp-1',
      duree: '9',
    });
  });

  it('getStagesByEtudiant retourne les stages tries par date', async () => {
    prismaMock.stage.findMany.mockResolvedValue([
      {
        experience_id: 'exp-1',
        experience: {
          titre: 'Stage backend',
          competence_dev: [],
        },
      },
    ]);

    const result = await stageService.getStagesByEtudiant('etu-1');

    expect(prismaMock.stage.findMany).toHaveBeenCalled();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          experience_id: 'exp-1',
        }),
      ])
    );
  });

  it('editStage reinitialise la validation quand le prof change', async () => {
    txMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Stage initial',
      description: 'Description initiale',
      date_experience: new Date('2026-05-01'),
      type_specifique: 'academique',
      photo: 'https://cdn.example.com/old-photo.png',
        stage: {
          date_fin: new Date('2026-05-10'),
          duree: '9',
          missions_realisees: 'Mission 1',
          rapport_stage: 'rapport.pdf',
          validation: {
            utilisateur_id: 'prof-old',
            statut: 'en_attente',
            professeur: {
              utilisateur: {
                prenom: 'Old',
                nom: 'Prof',
              },
            },
          },
        },
      });

    txMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-new',
        email: 'new-prof@example.com',
        professeur: { prof_utilisateur_id: 'prof-new' },
      })
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        nom: 'Doe',
        prenom: 'Jane',
      });

    txMock.experience.update.mockResolvedValue({
      experience_id: 'exp-1',
    });

    txMock.stage.update.mockResolvedValue({
      experience_id: 'exp-1',
      duree: '11',
    });

    txMock.valideStage.update.mockResolvedValue({
      experience_id: 'exp-1',
      utilisateur_id: 'prof-new',
      statut: 'en_attente',
    });

    txMock.stage.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      duree: '11',
      experience: {
        experience_id: 'exp-1',
        titre: 'Stage final',
        visibilite: false,
        type: 'stage',
        type_specifique: 'academique',
        utilisateur_id: 'etu-1',
        competence_dev: [{ competence: { nom: 'NestJS' } }],
      },
      validation: {
        statut: 'en_attente',
      },
    });

    const result = await stageService.editStage(
      'etu-1',
      'exp-1',
      {
        titre: 'Stage final',
        description: 'Nouvelle description',
        date_debut: '2026-05-01',
        date_fin: '2026-05-12',
        technologies: '["NestJS"]',
        domaines: '["Backend"]',
        email_professeur: 'new-prof@example.com',
      },
      {
        originalname: 'photo.png',
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      }
    );

    expect(photoUtilsMock.remplacerPhoto).toHaveBeenCalled();
    expect(supprimerCompetencesDeveloppeesMock).toHaveBeenCalledWith(
      txMock,
      'exp-1',
      'etu-1'
    );

    expect(lierCompetencesExperienceMock).toHaveBeenCalled();

    expect(result).toMatchObject({
      experience_id: 'exp-1',
      duree: '11',
    });
  });
});
