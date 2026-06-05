import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  experience: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
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
  },
  utilisateur: {
    findUnique: vi.fn(),
  },
  valideStage: {
    create: vi.fn(),
    update: vi.fn(),
  },
};

const storageBucketMock = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
};

const supabaseMock = {
  storage: {
    from: vi.fn(() => storageBucketMock),
  },
};

const creerNotificationMock = vi.fn();
const lierCompetencesExperienceMock = vi.fn();
const supprimerCompetencesDeveloppeesMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
}));

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: creerNotificationMock,
}));

vi.mock('../../src/services/competence.helper.js', () => ({
  lierCompetencesExperience: lierCompetencesExperienceMock,
  supprimerCompetencesDeveloppees: supprimerCompetencesDeveloppeesMock,
}));

const stageService = await import('../../src/services/stage.service.js');

describe('stage.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
    prismaMock.experience.findFirst.mockResolvedValue(null);
    supabaseMock.storage.from.mockReturnValue(storageBucketMock);
    lierCompetencesExperienceMock
      .mockReset()
      .mockResolvedValueOnce([{ competence_id: 'tech-1' }])
      .mockResolvedValueOnce([{ competence_id: 'dom-1' }]);
    supprimerCompetencesDeveloppeesMock.mockResolvedValue(undefined);
  });

  it('uploadPhoto envoie le fichier dans Supabase et retourne son URL publique', async () => {
    storageBucketMock.upload.mockResolvedValue({ error: null });
    storageBucketMock.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://cdn.example.com/stages/photo.png' },
    });

    const result = await stageService.uploadPhoto({
      originalname: 'photo.png',
      buffer: Buffer.from('image'),
      mimetype: 'image/png',
    });

    expect(storageBucketMock.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+_photo\.png$/),
      expect.any(Buffer),
      { contentType: 'image/png' }
    );
    expect(result).toBe('https://cdn.example.com/stages/photo.png');
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
      'https://cdn.example.com/photo.png'
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: {
        titre: 'Stage backend',
        date_experience: new Date('2026-05-01'),
        visibilite: false,
        type: 'stage',
        description: 'API interne',
        type_specifique: 'academique',
        utilisateur_id: 'etu-1',
        photo: 'https://cdn.example.com/photo.png',
      },
    });
    expect(txMock.stage.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        date_fin: new Date('2026-05-10'),
        duree: '9',
        missions_realisees: 'Developpement API',
        rapport_stage: 'https://cdn.example.com/rapport.pdf',
      },
    });
    expect(txMock.valideStage.create).toHaveBeenCalledWith({
      data: {
        utilisateur_id: 'prof-1',
        experience_id: 'exp-1',
        statut: 'en_attente',
        date_d_action: expect.any(Date),
      },
    });
    expect(creerNotificationMock).toHaveBeenCalledWith(
      'prof-1',
      expect.stringContaining('Stage backend'),
      'validation_stage',
      { utilisateurSourceId: 'etu-1' }
    );
    expect(result.competences).toEqual([{ competence_id: 'tech-1' }, { competence_id: 'dom-1' }]);
  });

  it('creeStage refuse un doublon de titre', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({ experience_id: 'exp-dup' });

    await expect(
      stageService.creeStage(
        'etu-1',
        {
          titre: 'Stage backend',
          description: 'API interne',
          date_debut: '2026-05-01',
          date_fin: '2026-05-10',
        },
        null
      )
    ).rejects.toThrow('Stage');
  });

  it('getStagesByEtudiant retourne les experiences stage triees par date', async () => {
    prismaMock.experience.findMany.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const result = await stageService.getStagesByEtudiant('etu-1');

    expect(prismaMock.experience.findMany).toHaveBeenCalledWith({
      where: { utilisateur_id: 'etu-1', type: 'stage' },
      include: {
        stage: { include: { validation: true } },
        competence_dev: { include: { competence: true } },
      },
      orderBy: { date_experience: 'desc' },
    });
    expect(result).toEqual([{ experience_id: 'exp-1' }]);
  });

  it('editStage reinitialise la validation quand le prof change', async () => {
    txMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Stage initial',
      description: 'Description initiale',
      date_experience: new Date('2026-05-01'),
      type_specifique: 'academique',
      stage: {
        date_fin: new Date('2026-05-10'),
        duree: '9',
        missions_realisees: 'Mission 1',
        rapport_stage: 'rapport.pdf',
        validation: {
          utilisateur_id: 'prof-old',
          statut: 'en_attente',
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
    txMock.experience.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Stage final',
      stage: { duree: '11', validation: { statut: 'en_attente' } },
      competence_dev: [{ competence: { nom: 'NestJS' } }],
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
      'https://cdn.example.com/new-photo.png'
    );

    expect(txMock.valideStage.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: {
        statut: 'en_attente',
        utilisateur_id: 'prof-new',
        date_d_action: expect.any(Date),
      },
    });
    expect(result.experience_id).toBe('exp-1');
  });

  it('updateVisibiliteStageService refuse un stage academique non valide', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-acad',
      utilisateur_id: 'etu-1',
      type: 'stage',
      type_specifique: 'academique',
      stage: {
        validation: { statut: 'en_attente' },
      },
    });

    await expect(
      stageService.updateVisibiliteStageService('etu-1', 'exp-acad', true)
    ).rejects.toThrow('visibilit');
  });
});
