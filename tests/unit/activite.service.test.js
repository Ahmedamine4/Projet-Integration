import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  etudiant: {
    findUnique: vi.fn(),
  },
  administrateur: {
    findUnique: vi.fn(),
  },
  institution: {
    findUnique: vi.fn(),
  },
  valideEtudiant: {
    findUnique: vi.fn(),
  },
  activite: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  experience: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

const txMock = {
  experience: {
    create: vi.fn(),
    update: vi.fn(),
  },
  activite: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  competence: {
    create: vi.fn(),
  },
  documentation: {
    createMany: vi.fn(),
  },
  valideActivite: {
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

const service = await import('../../src/services/activite.service.js');

describe('activite.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
  });

  it('createActivite refuse si user absent avec 401', async () => {
    await expect(
      service.createActivite({}, null)
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Utilisateur non authentifie',
    });
  });

  it('createActivite refuse typeActivite invalide avec 400', async () => {
    await expect(
      service.createActivite(
        { typeActivite: 'autre' },
        { utilisateur_id: 'u1', role: 'etudiant' }
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'typeActivite doit etre "personnelle" ou "academique"',
    });
  });

  it('createActivite cree une activite personnelle pour un etudiant', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-1',
    });
    txMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      type: 'club',
    });

    const result = await service.createActivite(
      {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
        description: 'Description',
        visibilite: true,
      },
      { utilisateur_id: 'etu-1', role: 'etudiant' }
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        titre: 'Club',
        type: 'activite',
        visibilite: true,
        utilisateur_id: 'etu-1',
      }),
    });
    expect(txMock.activite.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        type: 'club',
        lieu: 'Campus',
      },
    });
    expect(result).toEqual({
      experience_id: 'exp-1',
      type: 'club',
    });
  });

  it('createActivite cree une activite personnelle pour un professionnel', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-2',
    });
    txMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-2',
      type: 'freelance',
    });

    const result = await service.createActivite(
      {
        typeActivite: 'personnelle',
        titre: 'Mission',
        type: 'freelance',
        lieu: 'Remote',
        visibleToEveryone: true,
      },
      { utilisateur_id: 'pro-1', role: 'professionnel' }
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        titre: 'Mission',
        type: 'activite',
        visibilite: true,
        utilisateur_id: 'pro-1',
      }),
    });
    expect(result).toEqual({
      experience_id: 'exp-2',
      type: 'freelance',
    });
  });

  it('createActivite refuse une activite personnelle pour un role non autorise avec 403', async () => {
    await expect(
      service.createActivite(
        {
          typeActivite: 'personnelle',
          titre: 'Club',
          type: 'club',
          lieu: 'Campus',
        },
        { utilisateur_id: 'admin-1', role: 'administrateur' }
      )
    ).rejects.toMatchObject({
      statusCode: 403,
      message:
        'Acces reserve aux etudiants et professionnels pour une activite personnelle',
    });
  });

  it("createActivite refuse une activite academique si l'utilisateur n'est pas etudiant", async () => {
    await expect(
      service.createActivite(
        {
          typeActivite: 'academique',
          titre: 'Conf',
          type: 'conference',
          lieu: 'Campus',
          institutionId: 'inst-1',
        },
        { utilisateur_id: 'pro-1', role: 'professionnel' }
      )
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Acces reserve aux etudiants',
    });
  });

  it('createActivite refuse une activite academique sans institutionId', async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue({
      etudiant_utilisateur_id: 'etu-1',
    });

    await expect(
      service.createActivite(
        {
          typeActivite: 'academique',
          titre: 'Conf',
          type: 'conference',
          lieu: 'Campus',
        },
        { utilisateur_id: 'etu-1', role: 'etudiant' }
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'institutionId est obligatoire pour une activite academique',
    });
  });

  it('createActivite cree une activite academique avec validation en_attente', async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue({
      etudiant_utilisateur_id: 'etu-1',
    });
    prismaMock.institution.findUnique.mockResolvedValue({
      institution_id: 'inst-1',
    });
    prismaMock.valideEtudiant.findUnique.mockResolvedValue({
      utilisateur_id: 'etu-1',
      institution_id: 'inst-1',
    });
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-3',
    });
    txMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-3',
      validation: { statut: 'en_attente' },
    });

    const result = await service.createActivite(
      {
        typeActivite: 'academique',
        titre: 'Conf',
        type: 'conference',
        lieu: 'Campus',
        institutionId: 'inst-1',
        visibilite: true,
      },
      { utilisateur_id: 'etu-1', role: 'etudiant' }
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        visibilite: false,
      }),
    });
    expect(txMock.valideActivite.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-3',
        institution_id: 'inst-1',
        statut: 'en_attente',
        commentaire: null,
        date_d_action: expect.any(Date),
      },
    });
    expect(result).toEqual({
      experience_id: 'exp-3',
      validation: { statut: 'en_attente' },
    });
  });

  it("createActivite refuse une activite academique si l'etudiant n'est pas lie a l'institution", async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue({
      etudiant_utilisateur_id: 'etu-1',
    });
    prismaMock.institution.findUnique.mockResolvedValue({
      institution_id: 'inst-1',
    });
    prismaMock.valideEtudiant.findUnique.mockResolvedValue(null);

    await expect(
      service.createActivite(
        {
          typeActivite: 'academique',
          titre: 'Conf',
          type: 'conference',
          lieu: 'Campus',
          institutionId: 'inst-1',
        },
        { utilisateur_id: 'etu-1', role: 'etudiant' }
      )
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Cette institution n'est pas liee a l'etudiant",
    });
  });

  it('getMesActivitesService appelle prisma.activite.findMany avec utilisateur_id', async () => {
    prismaMock.activite.findMany.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const result = await service.getMesActivitesService({
      utilisateur_id: 'etu-1',
      role: 'etudiant',
    });

    expect(prismaMock.activite.findMany).toHaveBeenCalledWith({
      where: {
        experience: {
          utilisateur_id: 'etu-1',
        },
      },
      include: {
        experience: {
          include: {
            documentations: true,
            competences: true,
          },
        },
        validation: {
          include: {
            institution: true,
          },
        },
      },
      orderBy: {
        experience: {
          date_experience: 'desc',
        },
      },
    });
    expect(result).toEqual([{ experience_id: 'exp-1' }]);
  });

  it('updateValidationActiviteService refuse un statut invalide', async () => {
    prismaMock.administrateur.findUnique.mockResolvedValue({
      admin_utilisateur_id: 'admin-1',
    });

    await expect(
      service.updateValidationActiviteService(
        'exp-1',
        { statut: 'en_attente' },
        { utilisateur_id: 'admin-1', role: 'administrateur' }
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Statut de validation invalide',
    });
  });

  it("updateValidationActiviteService met a jour la validation et rend l'experience visible si statut = valide", async () => {
    prismaMock.administrateur.findUnique.mockResolvedValue({
      admin_utilisateur_id: 'admin-1',
    });
    prismaMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      validation: { statut: 'en_attente' },
    });
    txMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      experience: { visibilite: true },
      validation: { statut: 'valide' },
    });

    const result = await service.updateValidationActiviteService(
      'exp-1',
      { statut: 'valide', commentaire: 'OK' },
      { utilisateur_id: 'admin-1', role: 'administrateur' }
    );

    expect(txMock.valideActivite.update).toHaveBeenCalledWith({
      where: {
        experience_id: 'exp-1',
      },
      data: {
        statut: 'valide',
        commentaire: 'OK',
        date_d_action: expect.any(Date),
      },
    });
    expect(txMock.experience.update).toHaveBeenCalledWith({
      where: {
        experience_id: 'exp-1',
      },
      data: {
        visibilite: true,
      },
    });
    expect(result).toEqual({
      experience_id: 'exp-1',
      experience: { visibilite: true },
      validation: { statut: 'valide' },
    });
  });

  it('updateValidationActiviteService refuse si le user nest pas admin', async () => {
    await expect(
      service.updateValidationActiviteService(
        'exp-1',
        { statut: 'valide' },
        { utilisateur_id: 'etu-1', role: 'etudiant' }
      )
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Acces reserve aux administrateurs',
    });
  });

  it("updateValidationActiviteService rend l'experience non visible si statut = refuse", async () => {
    prismaMock.administrateur.findUnique.mockResolvedValue({
      admin_utilisateur_id: 'admin-1',
    });
    prismaMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-2',
      validation: { statut: 'en_attente' },
    });
    txMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-2',
      experience: { visibilite: false },
      validation: { statut: 'refuse' },
    });

    const result = await service.updateValidationActiviteService(
      'exp-2',
      { statut: 'refuse', commentaire: 'Informations insuffisantes' },
      { utilisateur_id: 'admin-1', role: 'administrateur' }
    );

    expect(txMock.experience.update).toHaveBeenCalledWith({
      where: {
        experience_id: 'exp-2',
      },
      data: {
        visibilite: false,
      },
    });
    expect(result).toEqual({
      experience_id: 'exp-2',
      experience: { visibilite: false },
      validation: { statut: 'refuse' },
    });
  });

  it('getPortfolioPublicActivitiesService retourne uniquement les activites visibles et publiques', async () => {
    prismaMock.activite.findMany.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const result = await service.getPortfolioPublicActivitiesService('etu-1');

    expect(prismaMock.activite.findMany).toHaveBeenCalledWith({
      where: {
        experience: {
          utilisateur_id: 'etu-1',
          type: 'activite',
          visibilite: true,
        },
        OR: [
          {
            validation: {
              is: null,
            },
          },
          {
            validation: {
              is: {
                statut: 'valide',
              },
            },
          },
        ],
      },
      include: {
        experience: {
          include: {
            documentations: true,
            competences: true,
          },
        },
        validation: {
          include: {
            institution: true,
          },
        },
      },
      orderBy: {
        experience: {
          date_experience: 'desc',
        },
      },
    });
    expect(result).toEqual([{ experience_id: 'exp-1' }]);
  });
});
