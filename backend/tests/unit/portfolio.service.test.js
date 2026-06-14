import { beforeEach, describe, expect, it, vi } from 'vitest';

const txMock = {
  portfolio: {
    update: vi.fn(),
  },
  portfolioScoreHistory: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

const prismaMock = {
  $transaction: vi.fn(),
  utilisateur: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  etudiant: {
    findUnique: vi.fn(),
  },
  experience: {
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  certification: {
    count: vi.fn(),
  },
  lettresDeRecommendations: {
    count: vi.fn(),
  },
  repository: {
    findFirst: vi.fn(),
  },
  portfolioScoreHistory: {
    findMany: vi.fn(),
  },
};

const stageServiceMock = {
  getStagesByEtudiant: vi.fn(),
  getStagesVisiblesByEtudiant: vi.fn(),
};

const projetServiceMock = {
  getProjetsByEtudiant: vi.fn(),
  getProjetsVisiblesByEtudiant: vi.fn(),
};

const activiteServiceMock = {
  getActivitesByEtudiant: vi.fn(),
  getActivitesVisiblesByEtudiant: vi.fn(),
};

const certificationServiceMock = {
  getCertificationsByEtudiant: vi.fn(),
  getCertificationsVisiblesByEtudiant: vi.fn(),
};

const competenceHelperMock = {
  getCompetencesByExperience: vi.fn(),
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/services/stage.service.js', () => stageServiceMock);
vi.mock('../../src/services/projet.service.js', () => projetServiceMock);
vi.mock('../../src/services/activite.service.js', () => activiteServiceMock);
vi.mock('../../src/services/certification.service.js', () => certificationServiceMock);
vi.mock('../../src/services/competence.helper.js', () => competenceHelperMock);

vi.mock('../../src/services/github.service.js', () => ({
  getUserContributions: vi.fn(),
}));

const portfolioService = await import('../../src/services/portfolio.service.js');

const mockEtudiant = {
  etudiant_utilisateur_id: 'etu-1',
  utilisateur: {
    nom: 'Doe',
    prenom: 'Jane',
    email: 'jane@test.com',
    telephone: null,
    a_propos: null,
    github: null,
    instagram: null,
    x: null,
    linkedin: null,
    photo: null,
    _count: {
      followers: 0,
    },
  },
  portfolio: {
    portfolio_id: 'portfolio-1',
    titre: null,
    objectif_cible: null,
    visibilite: true,
    _count: {
      interactions: 0,
    },
  },
  badges: [],
  clubs: [],
  institutions: [],
};

describe('portfolio.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

    prismaMock.experience.count.mockResolvedValue(0);
    prismaMock.certification.count.mockResolvedValue(0);
    prismaMock.lettresDeRecommendations.count.mockResolvedValue(0);
    prismaMock.repository.findFirst.mockResolvedValue(null);

    txMock.portfolio.update.mockResolvedValue({});
    txMock.portfolioScoreHistory.findFirst.mockResolvedValue(null);
    txMock.portfolioScoreHistory.create.mockResolvedValue({});

    stageServiceMock.getStagesByEtudiant.mockResolvedValue([]);
    stageServiceMock.getStagesVisiblesByEtudiant.mockResolvedValue([]);

    projetServiceMock.getProjetsByEtudiant.mockResolvedValue([]);
    projetServiceMock.getProjetsVisiblesByEtudiant.mockResolvedValue([]);

    activiteServiceMock.getActivitesByEtudiant.mockResolvedValue([]);
    activiteServiceMock.getActivitesVisiblesByEtudiant.mockResolvedValue([]);

    certificationServiceMock.getCertificationsByEtudiant.mockResolvedValue([]);
    certificationServiceMock.getCertificationsVisiblesByEtudiant.mockResolvedValue([]);

    competenceHelperMock.getCompetencesByExperience.mockResolvedValue({
      technologies: [],
      domaines: [],
    });
  });

  it('getAboutByUserId retourne ownerId et about si utilisateur trouve', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      a_propos: 'Texte portfolio',
    });

    const result = await portfolioService.getAboutByUserId('u1');

    expect(result).toEqual({
      ownerId: 'u1',
      about: 'Texte portfolio',
    });
  });

  it('updateUserAboutByUserId met a jour a_propos sans effet annexe', async () => {
    prismaMock.utilisateur.update.mockResolvedValue({
      utilisateur_id: 'u2',
      a_propos: 'Nouveau texte',
    });

    const result = await portfolioService.updateUserAboutByUserId(
      'u2',
      'Nouveau texte'
    );

    expect(prismaMock.utilisateur.update).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u2' },
      data: { a_propos: 'Nouveau texte' },
      select: { utilisateur_id: true, a_propos: true },
    });

    expect(result).toEqual({
      utilisateur_id: 'u2',
      a_propos: 'Nouveau texte',
    });
  });

  it('getPortfolioEtudiant charge toutes les donnees privees pour le proprietaire', async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue(mockEtudiant);

    stageServiceMock.getStagesByEtudiant.mockResolvedValue([
      { experience_id: 'stage-1' },
    ]);

    projetServiceMock.getProjetsByEtudiant.mockResolvedValue([
      { experience_id: 'projet-1' },
    ]);

    activiteServiceMock.getActivitesByEtudiant.mockResolvedValue([
      { experience_id: 'activite-1' },
    ]);

    certificationServiceMock.getCertificationsByEtudiant.mockResolvedValue([
      { experience_id: 'certification-1' },
    ]);

    const result = await portfolioService.getPortfolioEtudiant('etu-1', true);

    expect(result.isOwner).toBe(true);
    expect(result.projets).toHaveLength(1);
    expect(result.stages).toHaveLength(1);
    expect(result.activites).toHaveLength(1);
    expect(result.certifications).toHaveLength(1);
    expect(result.score_credibilite).toBeDefined();
  });

  it('getPortfolioEtudiant applique le score de highlight selon les filtres', async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue(mockEtudiant);

    stageServiceMock.getStagesVisiblesByEtudiant.mockResolvedValue([
      {
        experience_id: 'stage-visible',
        competence_dev: [
          { competence: { type: 'technologie', nom: 'Node.js' } },
          { competence: { type: 'domaine', nom: 'Web' } },
        ],
      },
    ]);

    const result = await portfolioService.getPortfolioEtudiant('etu-1', false, {
      technologies: ['Node.js'],
      domaines: ['Web'],
    });

    expect(result.stages[0]).toMatchObject({
      highlighted: true,
      score: 100,
      techCount: 1,
      domaineCount: 1,
    });
  });

  it('getExperienceById assemble les details et competences de lexperience', async () => {
    prismaMock.experience.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Projet IA',
      type: 'projet',
      type_specifique: 'academique',
      date_experience: new Date('2026-06-01'),
      description: 'Description',
      photo: null,
      visibilite: true,
      is_draft: false,
      utilisateur_id: 'etu-1',
      stage: null,
      projet: {
        lien_github: 'https://github.com/demo/repo',
        validation: null,
      },
      activite: null,
      certification: null,
    });

    competenceHelperMock.getCompetencesByExperience.mockResolvedValue({
      technologies: ['Node.js'],
      domaines: ['Web'],
    });

    const result = await portfolioService.getExperienceById('exp-1');

    expect(result).toMatchObject({
      experience_id: 'exp-1',
      type: 'projet',
      technologies: ['Node.js'],
      domaines: ['Web'],
      details: {
        lien_github: 'https://github.com/demo/repo',
        validation: null,
      },
    });
  });
});