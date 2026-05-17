import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  experience: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  valideStage: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  notification: {
    create: vi.fn(),
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
  competence: {
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  utilisateur: {
    findUnique: vi.fn(),
  },
  valideStage: {
    create: vi.fn(),
    update: vi.fn(),
  },
  documentation: {
    create: vi.fn(),
    findFirst: vi.fn(),
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

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
}));

const stageService = await import('../../src/services/stage.service.js');

describe('stage.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
    prismaMock.experience.findFirst.mockResolvedValue(null);
    supabaseMock.storage.from.mockReturnValue(storageBucketMock);
  });

  it('uploadPhoto envoie le fichier dans Supabase et retourne son URL publique', async () => {
    storageBucketMock.upload.mockResolvedValue({ error: null });
    storageBucketMock.getPublicUrl.mockReturnValue({
      data: {
        publicUrl: 'https://cdn.example.com/stages/photo.png',
      },
    });

    const result = await stageService.uploadPhoto({
      originalname: 'photo.png',
      buffer: Buffer.from('image'),
      mimetype: 'image/png',
    });

    expect(supabaseMock.storage.from).toHaveBeenCalledWith('stages-photos');
    expect(storageBucketMock.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+_photo\.png$/),
      expect.any(Buffer),
      { contentType: 'image/png' }
    );
    expect(storageBucketMock.getPublicUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+_photo\.png$/)
    );
    expect(result).toBe('https://cdn.example.com/stages/photo.png');
  });

  it('uploadPhoto lance une erreur si Supabase refuse l upload', async () => {
    storageBucketMock.upload.mockResolvedValue({
      error: {
        message: 'bucket inaccessible',
      },
    });

    await expect(
      stageService.uploadPhoto({
        originalname: 'photo.png',
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      })
    ).rejects.toThrow('Erreur upload photo : bucket inaccessible');
  });

  it('createStage cree experience, stage, competences, validation et documentation', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Stage backend',
    });
    txMock.stage.create.mockResolvedValue({
      experience_id: 'exp-1',
      duree: '10',
    });
    txMock.competence.create
      .mockResolvedValueOnce({ competence_id: 'c1', nom: 'Node.js' })
      .mockResolvedValueOnce({ competence_id: 'c2', nom: 'Express' })
      .mockResolvedValueOnce({ competence_id: 'c3', nom: 'Web' });
    txMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-1',
        email: 'prof@example.com',
        professeur: {
          professeur_utilisateur_id: 'prof-1',
        },
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
    txMock.documentation.create.mockResolvedValue({
      documentation_id: 'doc-1',
      captures: 'https://cdn.example.com/photo.png',
    });

    const result = await stageService.createStage(
      'etu-1',
      {
        titre: 'Stage backend',
        description: 'API interne',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        missions_realisees: 'Developpement API',
        rapport_stage: 'https://cdn.example.com/rapport.pdf',
        technologies: JSON.stringify(['Node.js', 'Express']),
        domaines: JSON.stringify(['Web']),
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
        utilisateur_id: 'etu-1',
      },
    });
    expect(txMock.stage.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        duree: '9',
        missions_realisees: 'Developpement API',
        rapport_stage: 'https://cdn.example.com/rapport.pdf',
      },
    });
    expect(txMock.competence.create).toHaveBeenCalledTimes(3);
    expect(txMock.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { email: 'prof@example.com' },
      include: { professeur: true },
    });
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        message: expect.stringContaining('Jane Doe'),
        type: 'validation_stage',
        lu: false,
        date_notification: expect.any(Date),
        utilisateur_id: 'prof-1',
      }),
    });
    expect(txMock.valideStage.create).toHaveBeenCalledWith({
      data: {
        utilisateur_id: 'prof-1',
        experience_id: 'exp-1',
        statut: 'en_attente',
      },
    });
    expect(txMock.documentation.create).toHaveBeenCalledWith({
      data: {
        captures: 'https://cdn.example.com/photo.png',
        experience_id: 'exp-1',
      },
    });
    expect(result).toMatchObject({
      experience: {
        experience_id: 'exp-1',
      },
      stage: {
        experience_id: 'exp-1',
      },
      validation: {
        utilisateur_id: 'prof-1',
      },
      documentation: {
        captures: 'https://cdn.example.com/photo.png',
      },
    });
    expect(result.competences).toHaveLength(3);
  });

  it('createStage cree aussi une validation academique si is_academique vaut true en boolean', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-bool',
      titre: 'Stage académique booléen',
    });
    txMock.stage.create.mockResolvedValue({
      experience_id: 'exp-bool',
      duree: '4',
    });
    txMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-bool',
        email: 'prof@example.com',
        professeur: {
          professeur_utilisateur_id: 'prof-bool',
        },
      })
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        nom: 'Doe',
        prenom: 'Jane',
      });
    txMock.valideStage.create.mockResolvedValue({
      experience_id: 'exp-bool',
      utilisateur_id: 'prof-bool',
      statut: 'en_attente',
    });

    const result = await stageService.createStage(
      'etu-1',
      {
        titre: 'Stage académique booléen',
        description: 'Projet',
        date_debut: '2026-05-01',
        date_fin: '2026-05-05',
        technologies: JSON.stringify([]),
        domaines: JSON.stringify([]),
        is_academique: true,
        email_professeur: 'prof@example.com',
      },
      null
    );

    expect(txMock.valideStage.create).toHaveBeenCalledWith({
      data: {
        utilisateur_id: 'prof-bool',
        experience_id: 'exp-bool',
        statut: 'en_attente',
      },
    });
    expect(result.validation).toMatchObject({
      utilisateur_id: 'prof-bool',
      statut: 'en_attente',
    });
  });

  it('createStage refuse un stage academique si le professeur est introuvable', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-2',
    });
    txMock.stage.create.mockResolvedValue({
      experience_id: 'exp-2',
      duree: '5',
    });
    txMock.utilisateur.findUnique.mockResolvedValue(null);

    await expect(
      stageService.createStage(
        'etu-1',
        {
          titre: 'Stage academique',
          description: 'Projet',
          date_debut: '2026-05-01',
          date_fin: '2026-05-05',
          technologies: JSON.stringify([]),
          domaines: JSON.stringify([]),
          is_academique: 'true',
          email_professeur: 'missing@example.com',
        },
        null
      )
    ).rejects.toThrow('Professeur non trouv');
  });

  it('getStagesByEtudiant retourne les experiences de type stage triees par date', async () => {
    prismaMock.experience.findMany.mockResolvedValue([
      {
        experience_id: 'exp-1',
        type: 'stage',
      },
    ]);

    const result = await stageService.getStagesByEtudiant('etu-1');

    expect(prismaMock.experience.findMany).toHaveBeenCalledWith({
      where: {
        utilisateur_id: 'etu-1',
        type: 'stage',
      },
      include: {
        stage: {
          include: { validation: true },
        },
        competences: true,
        documentations: true,
      },
      orderBy: { date_experience: 'desc' },
    });
    expect(result).toEqual([
      {
        experience_id: 'exp-1',
        type: 'stage',
      },
    ]);
  });

  it('updateStage met a jour le stage, ses competences, sa photo et reinitialise la validation', async () => {
    txMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Stage initial',
      description: 'Description initiale',
      date_experience: new Date('2026-05-01'),
      stage: {
        duree: '9',
        missions_realisees: 'Mission 1',
        rapport_stage: 'rapport.pdf',
        validation: {
          utilisateur_id: 'prof-old',
        },
      },
    });
    txMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-new',
        email: 'new-prof@example.com',
        professeur: { professeur_utilisateur_id: 'prof-new' },
      })
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        nom: 'Doe',
        prenom: 'Jane',
      });
    txMock.documentation.findFirst.mockResolvedValue({
      documentation_id: 'doc-1',
    });
    txMock.experience.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Stage final',
      stage: { duree: '11', validation: { statut: 'en_attente' } },
      competences: [{ nom: 'NestJS' }, { nom: 'Backend' }],
      documentations: [{ captures: 'https://cdn.example.com/new-photo.png' }],
    });

    const result = await stageService.updateStage(
      'etu-1',
      'exp-1',
      {
        titre: 'Stage final',
        description: 'Nouvelle description',
        date_debut: '2026-05-01',
        date_fin: '2026-05-12',
        technologies: JSON.stringify(['NestJS']),
        domaines: JSON.stringify(['Backend']),
        email_professeur: 'new-prof@example.com',
      },
      'https://cdn.example.com/new-photo.png'
    );

    expect(txMock.experience.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: expect.objectContaining({
        titre: 'Stage final',
        description: 'Nouvelle description',
        visibilite: false,
      }),
    });
    expect(txMock.stage.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: expect.objectContaining({
        duree: '11',
      }),
    });
    expect(txMock.competence.deleteMany).toHaveBeenCalledWith({
      where: {
        experiences: {
          some: { experience_id: 'exp-1' },
        },
      },
    });
    expect(txMock.valideStage.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: {
        statut: 'en_attente',
        utilisateur_id: 'prof-new',
        date_d_action: null,
        commentaire: null,
      },
    });
    expect(txMock.documentation.update).toHaveBeenCalledWith({
      where: { documentation_id: 'doc-1' },
      data: { captures: 'https://cdn.example.com/new-photo.png' },
    });
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        utilisateur_id: 'prof-new',
        type: 'validation_stage',
      }),
    });
    expect(result).toMatchObject({
      experience_id: 'exp-1',
      titre: 'Stage final',
    });
  });

  it('updateStage refuse si le stage est introuvable', async () => {
    txMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      stageService.updateStage('etu-1', 'missing-exp', {}, null)
    ).rejects.toThrow('Stage non trouvé');
  });

  it('updateStage cree une validation si le stage n en avait pas et qu un professeur est ajoute', async () => {
    txMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-2',
      titre: 'Stage sans validation',
      description: 'Description',
      date_experience: new Date('2026-05-01'),
      stage: {
        duree: '5',
        missions_realisees: null,
        rapport_stage: null,
        validation: null,
      },
    });
    txMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-1',
        email: 'prof@example.com',
        professeur: { professeur_utilisateur_id: 'prof-1' },
      })
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        nom: 'Doe',
        prenom: 'Jane',
      });
    txMock.experience.findUnique.mockResolvedValue({
      experience_id: 'exp-2',
      stage: { validation: { statut: 'en_attente' } },
      competences: [],
      documentations: [],
    });

    await stageService.updateStage(
      'etu-1',
      'exp-2',
      {
        email_professeur: 'prof@example.com',
      },
      null
    );

    expect(txMock.valideStage.create).toHaveBeenCalledWith({
      data: {
        utilisateur_id: 'prof-1',
        experience_id: 'exp-2',
        statut: 'en_attente',
      },
    });
  });

  it('getDemandesValidationProfesseur retourne les demandes en attente du professeur', async () => {
    prismaMock.valideStage.findMany.mockResolvedValue([
      { experience_id: 'exp-10', statut: 'en_attente' },
    ]);

    const result = await stageService.getDemandesValidationProfesseur('prof-1');

    expect(prismaMock.valideStage.findMany).toHaveBeenCalledWith({
      where: {
        utilisateur_id: 'prof-1',
        statut: 'en_attente',
      },
      include: expect.any(Object),
      orderBy: { date_d_action: 'desc' },
    });
    expect(result).toEqual([{ experience_id: 'exp-10', statut: 'en_attente' }]);
  });

  it('traiterValidationStage refuse si la demande est introuvable', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue(null);

    await expect(
      stageService.traiterValidationStage('prof-1', 'exp-404', 'valide')
    ).rejects.toThrow('Demande de validation non trouvée');
  });

  it('traiterValidationStage refuse si le professeur nest pas concerne', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'autre-prof',
      statut: 'en_attente',
    });

    await expect(
      stageService.traiterValidationStage('prof-1', 'exp-403', 'valide')
    ).rejects.toThrow('Accès refusé');
  });

  it('traiterValidationStage refuse si la demande a deja ete traitee', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'valide',
    });

    await expect(
      stageService.traiterValidationStage('prof-1', 'exp-409', 'valide')
    ).rejects.toThrow('Cette demande a déjà été traitée');
  });

  it('traiterValidationStage valide un stage, le rend visible et notifie letudiant', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      stage: {
        experience: {
          titre: 'Stage backend',
          utilisateur_id: 'etu-1',
        },
      },
    });
    prismaMock.valideStage.update.mockResolvedValue({
      experience_id: 'exp-1',
      statut: 'valide',
      commentaire: null,
    });

    const result = await stageService.traiterValidationStage(
      'prof-1',
      'exp-1',
      'valide',
      undefined
    );

    expect(prismaMock.valideStage.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: {
        statut: 'valide',
        commentaire: null,
        date_d_action: expect.any(Date),
      },
    });
    expect(prismaMock.experience.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: { visibilite: true },
    });
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        utilisateur_id: 'etu-1',
        type: 'validation_stage',
        message: expect.stringContaining('validé'),
      }),
    });
    expect(result).toEqual({
      experience_id: 'exp-1',
      statut: 'valide',
      commentaire: null,
    });
  });

  it('traiterValidationStage refuse un stage avec commentaire et notifie letudiant', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      stage: {
        experience: {
          titre: 'Stage backend',
          utilisateur_id: 'etu-1',
        },
      },
    });
    prismaMock.valideStage.update.mockResolvedValue({
      experience_id: 'exp-2',
      statut: 'refuse',
      commentaire: 'À compléter',
    });

    const result = await stageService.traiterValidationStage(
      'prof-1',
      'exp-2',
      'refuse',
      'À compléter'
    );

    expect(prismaMock.experience.update).not.toHaveBeenCalled();
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        utilisateur_id: 'etu-1',
        type: 'validation_stage',
        message: expect.stringContaining('À compléter'),
      }),
    });
    expect(result).toEqual({
      experience_id: 'exp-2',
      statut: 'refuse',
      commentaire: 'À compléter',
    });
  });
});
