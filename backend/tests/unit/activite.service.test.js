import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  notification: {
    create: vi.fn(),
  },
  activite: {
    findMany: vi.fn(),
  },
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
  },
  activite: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
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

const lierCompetencesExperienceMock = vi.fn();
const supprimerCompetencesDeveloppeesMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
}));

vi.mock('../../src/services/competence.helper.js', () => ({
  lierCompetencesExperience: lierCompetencesExperienceMock,
  supprimerCompetencesDeveloppees: supprimerCompetencesDeveloppeesMock,
}));

const service = await import('../../src/services/activite.service.js');

describe('activite.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
    prismaMock.experience.findFirst.mockResolvedValue(null);
    supabaseMock.storage.from.mockReturnValue(storageBucketMock);
    lierCompetencesExperienceMock.mockResolvedValue([{ competence_id: 'c1' }]);
    supprimerCompetencesDeveloppeesMock.mockResolvedValue(undefined);
  });

  it('uploadPhoto envoie le fichier sur Supabase et retourne l url publique', async () => {
    storageBucketMock.upload.mockResolvedValue({ error: null });
    storageBucketMock.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://cdn.example.com/activites/photo.png' },
    });

    const result = await service.uploadPhoto({
      originalname: 'photo.png',
      buffer: Buffer.from('image'),
      mimetype: 'image/png',
    });

    expect(storageBucketMock.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+_photo\.png$/),
      expect.any(Buffer),
      { contentType: 'image/png' }
    );
    expect(result).toBe('https://cdn.example.com/activites/photo.png');
  });

  it('creeActivite cree une activite invisible avec ses competences', async () => {
    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-1' });
    txMock.activite.create.mockResolvedValue({ experience_id: 'exp-1', type: 'club' });
    txMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      type: 'club',
      experience: {
        competence_dev: [{ competence: { nom: 'Node.js' } }],
      },
    });

    const result = await service.creeActivite(
      'etu-1',
      {
        titre: 'Club',
        date_experience: '2026-05-09',
        description: 'Description',
        typeActivite: 'club',
        lieu: 'Campus',
        competences: '[{"nom":"Node.js","type":"technologie"},{"nom":"Leadership","type":"soft-skill"}]',
      },
      'https://cdn.example.com/activites/photo.png'
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: {
        titre: 'Club',
        date_experience: new Date('2026-05-09'),
        visibilite: false,
        type: 'activite',
        description: 'Description',
        utilisateur_id: 'etu-1',
        photo: 'https://cdn.example.com/activites/photo.png',
      },
    });
    expect(txMock.activite.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        type: 'club',
        lieu: 'Campus',
      },
    });
    expect(lierCompetencesExperienceMock).toHaveBeenCalledTimes(2);
    expect(result.experience.competence_dev[0].competence.nom).toBe('Node.js');
  });

  it('creeActivite refuse un doublon de titre', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({ experience_id: 'exp-dup' });

    await expect(
      service.creeActivite(
        'etu-1',
        {
          titre: 'Club',
          date_experience: '2026-05-09',
          description: 'Description',
        },
        null
      )
    ).rejects.toThrow('Activité déjà existante');
  });

  it('getActivitesByEtudiant charge les activites de l etudiant', async () => {
    prismaMock.activite.findMany.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const result = await service.getActivitesByEtudiant('etu-1');

    expect(prismaMock.activite.findMany).toHaveBeenCalledWith({
      where: { experience: { utilisateur_id: 'etu-1' } },
      include: {
        clubs: true,
        experience: {
          include: {
            competence_dev: { include: { competence: true } },
          },
        },
      },
      orderBy: { experience: { date_experience: 'desc' } },
    });
    expect(result).toEqual([{ experience_id: 'exp-1' }]);
  });

  it('updateVisibiliteActiviteService refuse une activite introuvable', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      service.updateVisibiliteActiviteService('etu-1', 'exp-missing', true)
    ).rejects.toThrow('Activité non trouvée');
  });

  it('getActivitesVisiblesByEtudiant ne charge que les experiences visibles', async () => {
    prismaMock.experience.findMany.mockResolvedValue([]);

    await service.getActivitesVisiblesByEtudiant('etu-1');

    expect(prismaMock.experience.findMany).toHaveBeenCalledWith({
      where: { utilisateur_id: 'etu-1', type: 'activite', visibilite: true },
      include: {
        activite: { include: { validation: true, clubs: true } },
        competence_dev: { include: { competence: true } },
      },
      orderBy: { date_experience: 'desc' },
    });
  });
});
