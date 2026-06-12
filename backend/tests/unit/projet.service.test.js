import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  experience: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  projet: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

const txMock = {
  experience: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  projet: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  utilisateur: {
    findUnique: vi.fn(),
  },
  valideProjet: {
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
    VALIDATION_PROJET: 'validation_projet',
  },
}));

vi.mock('../../src/services/competence.helper.js', () => ({
  lierCompetencesExperience: lierCompetencesExperienceMock,
  supprimerCompetencesDeveloppees: supprimerCompetencesDeveloppeesMock,
  getCompetencesByExperience: getCompetencesByExperienceMock,
}));

vi.mock('../../src/utils/photo.utils.js', () => photoUtilsMock);

vi.mock('@prisma/client', () => ({
  TypeExperience: { projet: 'projet' },
  TypeSpecifique: {
    personnel: 'personnel',
    academique: 'academique',
  },
  TypeCompetence: {
    technologie: 'technologie',
    domaine: 'domaine',
  },
}));

const projetService = await import('../../src/services/projet.service.js');

describe('projet.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

    prismaMock.experience.findFirst.mockResolvedValue(null);
    prismaMock.experience.findMany.mockResolvedValue([]);
    prismaMock.experience.update.mockResolvedValue({});
    prismaMock.experience.delete.mockResolvedValue({});

    prismaMock.projet.findFirst.mockResolvedValue(null);
    prismaMock.projet.findMany.mockResolvedValue([]);
    prismaMock.projet.findUnique.mockResolvedValue(null);

    txMock.projet.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      experience: {
        competences: [],
      },
    });

    photoUtilsMock.uploadPhoto.mockResolvedValue('https://cdn.example.com/projet.png');
    photoUtilsMock.remplacerPhoto.mockResolvedValue('https://cdn.example.com/new-projet.png');
    photoUtilsMock.supprimerPhoto.mockResolvedValue(undefined);

    lierCompetencesExperienceMock.mockReset();
    lierCompetencesExperienceMock
      .mockResolvedValueOnce([{ competence_id: 'tech-1' }])
      .mockResolvedValueOnce([{ competence_id: 'dom-1' }]);

    supprimerCompetencesDeveloppeesMock.mockResolvedValue(undefined);
    getCompetencesByExperienceMock.mockResolvedValue([]);
  });

  it('creeProjet cree un projet personnel invisible avec competences', async () => {
    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-1' });

    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-1',
      lien_github: null,
    });

    txMock.projet.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      lien_github: null,
      experience: {
        competences: [],
      },
    });

    const result = await projetService.creeProjet(
      'etu-1',
      {
        projectTitle: 'Projet reel',
        projectDate: '2026-05-09',
        description: 'Description',
        githubLink: null,
        technologies: '["Node.js"]',
        domains: '["Web"]',
      },
      {
        originalname: 'projet.png',
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      }
    );

    expect(photoUtilsMock.uploadPhoto).toHaveBeenCalled();
    expect(txMock.experience.create).toHaveBeenCalled();
    expect(txMock.projet.create).toHaveBeenCalled();

    expect(result).toEqual(
      expect.objectContaining({
        experience_id: 'exp-1',
      })
    );
  });

  it('creeProjet academique cree une validation et notifie le professeur', async () => {
    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-2' });
    txMock.projet.create.mockResolvedValue({ experience_id: 'exp-2' });

    txMock.projet.findUnique.mockResolvedValue({
      experience_id: 'exp-2',
      experience: {
        competences: [],
      },
    });

    txMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-1',
        email: 'prof@example.com',
        professeur: {
          prof_utilisateur_id: 'prof-1',
        },
      })
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        nom: 'Doe',
        prenom: 'Jane',
      });

    txMock.valideProjet.create.mockResolvedValue({
      experience_id: 'exp-2',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
    });

    await projetService.creeProjet(
      'etu-1',
      {
        projectTitle: 'Projet academique',
        projectDate: '2026-05-10',
        description: 'Description',
        projetType: 'academique',
        professorEmail: 'prof@example.com',
        technologies: '[]',
        domains: '[]',
      },
      null
    );

    expect(txMock.valideProjet.create).toHaveBeenCalled();
    expect(creerNotificationMock).toHaveBeenCalledWith(
      'prof-1',
      expect.stringContaining('Projet academique'),
      'validation_projet'
    );
  });

  it('createDraftProjectsFromRepos ignore un repo etranger et ne recree pas un draft existant', async () => {
    prismaMock.projet.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ experience_id: 'exp-existing' });

    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-draft-1',
    });

    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-draft-1',
      repository_id: 'repo-1',
    });

    lierCompetencesExperienceMock.mockResolvedValue([
      { competence_id: 'lang-1' },
    ]);

    const result = await projetService.createDraftProjectsFromRepos('etu-1', [
      {
        repository_id: 'repo-foreign',
        etudiant_id: 'other-etu',
        title: 'Foreign repo',
        link: 'https://github.com/demo/foreign',
      },
      {
        repository_id: 'repo-1',
        etudiant_id: 'etu-1',
        title: 'Repo neuf',
        link: 'https://github.com/demo/repo-neuf',
        language: 'TypeScript',
      },
      {
        repository_id: 'repo-2',
        etudiant_id: 'etu-1',
        title: 'Repo deja lie',
        link: 'https://github.com/demo/repo-old',
      },
    ]);

    expect(result).toHaveLength(1);
    expect(creerNotificationMock).not.toHaveBeenCalled();
  });

  it('getProjetsByEtudiant retourne les projets de etudiant', async () => {
    prismaMock.projet.findMany.mockResolvedValue([
      {
        experience_id: 'exp-1',
        titre: 'Projet A',
        experience: {
          competences: [],
        },
      },
    ]);

    const result = await projetService.getProjetsByEtudiant('etu-1');

    expect(prismaMock.projet.findMany).toHaveBeenCalled();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          experience_id: 'exp-1',
          titre: 'Projet A',
        }),
      ])
    );
  });

  it('getProjetsVisiblesByEtudiant retourne uniquement les projets visibles', async () => {
    prismaMock.experience.findMany.mockResolvedValue([
      {
        experience_id: 'exp-1',
        visibilite: true,
      },
    ]);

    const result = await projetService.getProjetsVisiblesByEtudiant('etu-1');

    expect(prismaMock.experience.findMany).toHaveBeenCalled();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          experience_id: 'exp-1',
          visibilite: true,
        }),
      ])
    );
  });

  it('updateVisibiliteProjetService retourne erreur si projet introuvable', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      projetService.updateVisibiliteProjetService('etu-1', 'exp-1', true)
    ).rejects.toThrow('Projet non trouvé');
  });

  it('updateVisibiliteProjetService refuse projet academique non valide', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      type_specifique: 'academique',
      projet: {
        validation: {
          statut: 'en_attente',
        },
      },
    });

    await expect(
      projetService.updateVisibiliteProjetService('etu-1', 'exp-1', true)
    ).rejects.toThrow(
      "Vous ne pouvez changer la visibilité que si le projet académique n'est pas encore traité par le professeur"
    );
  });

  it('updateVisibiliteProjetService change la visibilite si projet personnel', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      type_specifique: 'personnel',
      projet: null,
    });

    prismaMock.experience.update.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: true,
    });

    const result = await projetService.updateVisibiliteProjetService(
      'etu-1',
      'exp-1',
      true
    );

    expect(prismaMock.experience.update).toHaveBeenCalledWith({
      where: {
        experience_id: 'exp-1',
      },
      data: {
        visibilite: true,
      },
      select: {
        experience_id: true,
        visibilite: true,
      },
    });

    expect(result.visibilite).toBe(true);
  });

  it('createDraftProjetFromRepository cree un draft depuis repository avec langage', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-draft',
    });

    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-draft',
      repository_id: 'repo-1',
    });

    lierCompetencesExperienceMock.mockResolvedValue([
      {
        competence_id: 'js',
      },
    ]);

    const result = await projetService.createDraftProjetFromRepository(
      {
        repository_id: 'repo-1',
        title: 'Repo A',
        description: 'Desc',
        link: 'https://github.com/a/repo',
        language: 'JavaScript',
      },
      'etu-1'
    );

    expect(txMock.experience.create).toHaveBeenCalled();
    expect(txMock.projet.create).toHaveBeenCalled();

    expect(lierCompetencesExperienceMock).toHaveBeenCalledWith(
      txMock,
      'exp-draft',
      'etu-1',
      ['JavaScript'],
      'technologie'
    );

    expect(result.projet.repository_id).toBe('repo-1');
  });

  it('supprimerProjetService retourne erreur si projet introuvable', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      projetService.supprimerProjetService('etu-1', 'exp-1')
    ).rejects.toThrow('Projet non trouvé');
  });

  it('supprimerProjetService refuse suppression si projet academique deja traite', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      type_specifique: 'academique',
      projet: {
        validation: {
          statut: 'valide',
        },
      },
    });

    await expect(
      projetService.supprimerProjetService('etu-1', 'exp-1')
    ).rejects.toThrow(
      'Ce projet a été validé, vous ne pouvez plus le supprimer. Utilisez la visibilité pour le masquer.'
    );
  });

  it('supprimerProjetService supprime photo puis soft delete experience', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      type_specifique: 'personnel',
      photo: 'https://cdn/projets-photos/img.png',
      projet: null,
    });

    prismaMock.experience.update.mockResolvedValue({
      experience_id: 'exp-1',
      deleted_at: new Date(),
    });

    await projetService.supprimerProjetService('etu-1', 'exp-1');

    expect(photoUtilsMock.supprimerPhoto).toHaveBeenCalledWith(
      'https://cdn/projets-photos/img.png',
      'projets-photos'
    );

    expect(prismaMock.experience.update).toHaveBeenCalledWith({
      where: {
        experience_id: 'exp-1',
      },
      data: {
        deleted_at: expect.any(Date),
      },
    });
  });
});
