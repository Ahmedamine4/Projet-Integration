import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
<<<<<<< HEAD
=======
  projet: {
    findFirst: vi.fn(),
  },
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
  utilisateur: {
    findFirst: vi.fn(),
  },
};

const txMock = {
  experience: {
    create: vi.fn(),
  },
  projet: {
    create: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('@prisma/client', () => ({
  RoleUtilisateur: {
    professeur: 'professeur',
  },
  StatutValidation: {
    en_attente: 'en_attente',
  },
  TypeExperience: {
    projet: 'projet',
  },
  TypeSpecifique: {
    academique: 'academique',
<<<<<<< HEAD
  },
}));

const { createProjet } = await import('../../src/services/projet.service.js');
=======
    personnel: 'personnel',
  },
}));

const {
  createProjet,
  createDraftProjetFromRepository,
  createDraftProjectsFromRepos,
} = await import('../../src/services/projet.service.js');
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)

describe('projet.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
  });

  it('createProjet cree une experience et un projet simple', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-1',
    });
    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-1',
      lien_github: 'https://github.com/demo/repo',
    });

    const result = await createProjet(
      {
        projectTitle: 'Projet PFE',
        projectDate: '2026-05-09',
        description: 'Description du projet',
        visibleToEveryone: true,
        githubLink: 'https://github.com/demo/repo',
        imageUrl: 'https://cdn.example.com/projet.png',
        technologies: ['Node.js', 'Express'],
        domains: ['Web'],
      },
      'etu-1'
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: {
        titre: 'Projet PFE',
        date_experience: new Date('2026-05-09'),
        description: 'Description du projet',
        visibilite: true,
        type: 'projet',
<<<<<<< HEAD
=======
        type_specifique: 'personnel',
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
        utilisateur_id: 'etu-1',
      },
    });
    expect(txMock.projet.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        lien_github: 'https://github.com/demo/repo',
        photo: 'https://cdn.example.com/projet.png',
        technologies: ['Node.js', 'Express'],
        domains: ['Web'],
<<<<<<< HEAD
=======
        is_draft: false,
        technologies_locked: false,
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
      },
    });
    expect(result).toEqual({
      experience: {
        experience_id: 'exp-1',
      },
      projet: {
        experience_id: 'exp-1',
        lien_github: 'https://github.com/demo/repo',
      },
    });
  });

  it('createProjet cree une validation academique si projetType est academique', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-2',
    });
    prismaMock.utilisateur.findFirst.mockResolvedValue({
      utilisateur_id: 'prof-1',
      email: 'prof@example.com',
    });
    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-2',
    });

    await createProjet(
      {
        projectTitle: 'Projet academique',
        projectDate: '2026-05-09',
        description: 'Memoire',
        visibleToEveryone: false,
        projetType: 'academique',
        professorEmail: 'prof@example.com',
      },
      'etu-2'
    );

    expect(prismaMock.utilisateur.findFirst).toHaveBeenCalledWith({
      where: {
        email: 'prof@example.com',
        role: 'professeur',
      },
    });
    expect(txMock.projet.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        experience_id: 'exp-2',
        validation: {
          create: {
            experience_id: 'exp-2',
            utilisateur_id: 'prof-1',
            statut: 'en_attente',
            date_d_action: expect.any(Date),
            commentaire: null,
          },
        },
      }),
    });
  });

  it('createProjet refuse un projet academique si le professeur est introuvable', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-3',
    });
    prismaMock.utilisateur.findFirst.mockResolvedValue(null);

    await expect(
      createProjet(
        {
          projectTitle: 'Projet academique',
          projectDate: '2026-05-09',
          description: 'Memoire',
          visibleToEveryone: false,
          projetType: 'academique',
          professorEmail: 'missing@example.com',
        },
        'etu-3'
      )
    ).rejects.toThrow('Professeur non trouv');

    expect(txMock.projet.create).not.toHaveBeenCalled();
  });
<<<<<<< HEAD
=======

  it('createDraftProjetFromRepository cree un projet brouillon GitHub invisible', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-draft-1',
    });
    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-draft-1',
      repository_id: 'repo-1',
      is_draft: true,
      technologies_locked: true,
    });

    const result = await createDraftProjetFromRepository(
      {
        repository_id: 'repo-1',
        name: 'portfolio-api',
        description: 'API portfolio',
        html_url: 'https://github.com/demo/portfolio-api',
        language: 'JavaScript',
      },
      'etu-4'
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: {
        titre: 'portfolio-api',
        description: 'API portfolio',
        visibilite: false,
        type: 'projet',
        type_specifique: 'personnel',
        utilisateur_id: 'etu-4',
      },
    });
    expect(txMock.projet.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-draft-1',
        repository_id: 'repo-1',
        lien_github: 'https://github.com/demo/portfolio-api',
        technologies: ['JavaScript'],
        domains: [],
        is_draft: true,
        technologies_locked: true,
      },
    });
    expect(result).toEqual({
      experience: { experience_id: 'exp-draft-1' },
      projet: {
        experience_id: 'exp-draft-1',
        repository_id: 'repo-1',
        is_draft: true,
        technologies_locked: true,
      },
    });
  });

  it('createDraftProjectsFromRepos ne recree pas un brouillon existant pour le meme repository', async () => {
    prismaMock.projet.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ experience_id: 'exp-existing' });
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-draft-2',
    });
    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-draft-2',
      repository_id: 'repo-1',
      is_draft: true,
      technologies_locked: true,
    });

    const result = await createDraftProjectsFromRepos('etu-5', [
      {
        repository_id: 'repo-1',
        name: 'new-repo',
        description: null,
        html_url: 'https://github.com/demo/new-repo',
        language: 'TypeScript',
      },
      {
        repository_id: 'repo-2',
        name: 'existing-repo',
        description: null,
        html_url: 'https://github.com/demo/existing-repo',
        language: 'Go',
      },
    ]);

    expect(prismaMock.projet.findFirst).toHaveBeenCalledTimes(2);
    expect(txMock.experience.create).toHaveBeenCalledTimes(1);
    expect(txMock.projet.create).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      experience: { experience_id: 'exp-draft-2' },
      projet: {
        experience_id: 'exp-draft-2',
        repository_id: 'repo-1',
        is_draft: true,
        technologies_locked: true,
      },
    });
  });
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
});
