import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  notification: {
    create: vi.fn(),
  },
  experience: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  projet: {
    findFirst: vi.fn(),
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

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: creerNotificationMock,
}));

vi.mock('../../src/services/competence.helper.js', () => ({
  lierCompetencesExperience: lierCompetencesExperienceMock,
  supprimerCompetencesDeveloppees: supprimerCompetencesDeveloppeesMock,
}));

vi.mock('@prisma/client', () => ({
  TypeExperience: { projet: 'projet' },
  TypeSpecifique: { personnel: 'personnel' },
  TypeCompetence: { technologie: 'technologie', domaine: 'domaine' },
}));

const projetService = await import('../../src/services/projet.service.js');

describe('projet.service', () => {
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

  it('creeProjet cree un projet personnel invisible avec competences', async () => {
    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-1' });
    txMock.projet.create.mockResolvedValue({ experience_id: 'exp-1', lien_github: null });

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
      'https://cdn.example.com/projet.png'
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: {
        titre: 'Projet reel',
        date_experience: new Date('2026-05-09'),
        visibilite: false,
        type: 'projet',
        description: 'Description',
        type_specifique: 'personnel',
        utilisateur_id: 'etu-1',
        photo: 'https://cdn.example.com/projet.png',
      },
    });
    expect(txMock.projet.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        lien_github: null,
      },
    });
    expect(result.competences).toEqual([{ competence_id: 'tech-1' }, { competence_id: 'dom-1' }]);
  });

  it('creeProjet academique cree une validation et notifie le professeur', async () => {
    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-2' });
    txMock.projet.create.mockResolvedValue({ experience_id: 'exp-2' });
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
    txMock.valideProjet.create.mockResolvedValue({
      experience_id: 'exp-2',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
    });

    const result = await projetService.creeProjet(
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

    expect(txMock.valideProjet.create).toHaveBeenCalledWith({
      data: {
        utilisateur_id: 'prof-1',
        experience_id: 'exp-2',
        statut: 'en_attente',
        date_d_action: expect.any(Date),
      },
    });
    expect(creerNotificationMock).toHaveBeenCalledWith(
      'prof-1',
      expect.stringContaining('Projet academique'),
      'validation_projet',
      { utilisateurSourceId: 'etu-1' }
    );
    expect(result.validation.utilisateur_id).toBe('prof-1');
  });

  it('creeProjet refuse un doublon de titre', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({ experience_id: 'exp-dup' });

    await expect(
      projetService.creeProjet(
        'etu-1',
        {
          projectTitle: 'Projet reel',
          projectDate: '2026-05-09',
          description: 'Description',
        },
        null
      )
    ).rejects.toThrow('Projet');
  });

  it('getProjetsVisiblesByEtudiant ne charge que les projets visibles', async () => {
    prismaMock.experience.findMany.mockResolvedValue([]);

    await projetService.getProjetsVisiblesByEtudiant('etu-visible');

    expect(prismaMock.experience.findMany).toHaveBeenCalledWith({
      where: {
        utilisateur_id: 'etu-visible',
        type: 'projet',
        visibilite: true,
      },
      include: {
        projet: { include: { validation: true } },
        competence_dev: { include: { competence: true } },
      },
      orderBy: { date_experience: 'desc' },
    });
  });

  it('editProjet refuse les technologies verrouillees depuis GitHub', async () => {
    txMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-locked',
      titre: 'Draft GitHub',
      description: 'Projet importe',
      date_experience: new Date('2026-05-09'),
      type_specifique: 'personnel',
      technologies_locked: true,
      projet: {
        lien_github: 'https://github.com/demo/repo',
        validation: null,
      },
    });

    await expect(
      projetService.editProjet(
        'etu-1',
        'exp-locked',
        { technologies: '["TypeScript"]' },
        null
      )
    ).rejects.toThrow('technologies');
  });

  it('updateVisibiliteProjetService refuse un projet academique non valide', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-acad',
      utilisateur_id: 'etu-1',
      type: 'projet',
      type_specifique: 'academique',
      projet: {
        validation: { statut: 'en_attente' },
      },
    });

    await expect(
      projetService.updateVisibiliteProjetService('etu-1', 'exp-acad', true)
    ).rejects.toThrow('visibilit');
  });

  it('createDraftProjectsFromRepos ignore un repo etranger et ne recree pas un draft existant', async () => {
    prismaMock.projet.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ experience_id: 'exp-existing' });

    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-draft-1' });
    txMock.projet.create.mockResolvedValue({
      experience_id: 'exp-draft-1',
      repository_id: 'repo-1',
      is_draft: true,
      technologies_locked: true,
    });
    lierCompetencesExperienceMock.mockResolvedValue([{ competence_id: 'lang-1' }]);

    const result = await projetService.createDraftProjectsFromRepos('etu-1', [
      {
        repository_id: 'repo-foreign',
        etudiant_id: 'other-etu',
        title: 'Foreign repo',
        description: null,
        link: 'https://github.com/demo/foreign',
        language: 'Go',
      },
      {
        repository_id: 'repo-1',
        etudiant_id: 'etu-1',
        title: 'Repo neuf',
        description: 'API',
        link: 'https://github.com/demo/repo-neuf',
        language: 'TypeScript',
      },
      {
        repository_id: 'repo-2',
        etudiant_id: 'etu-1',
        title: 'Repo deja lie',
        description: 'Old API',
        link: 'https://github.com/demo/repo-old',
        language: 'Rust',
      },
    ]);

    expect(prismaMock.projet.findFirst).toHaveBeenCalledTimes(2);
    expect(txMock.experience.create).toHaveBeenCalledTimes(1);
    expect(txMock.projet.create).toHaveBeenCalledTimes(1);
    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      'Votre projet brouillon a ete cree depuis GitHub.',
      'github_import',
      { utilisateurSourceId: 'etu-1' }
    );
    expect(result).toHaveLength(1);
  });
});
