import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  utilisateur: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  notification: {
    create: vi.fn(),
  },
  etudiant: {
    findUnique: vi.fn(),
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

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/services/stage.service.js', () => stageServiceMock);
vi.mock('../../src/services/projet.service.js', () => projetServiceMock);
vi.mock('../../src/services/activite.service.js', () => activiteServiceMock);
vi.mock('../../src/services/certification.service.js', () => certificationServiceMock);

const portfolioService = await import('../../src/services/portfolio.service.js');

describe('portfolio.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAboutByUserId retourne ownerId et about si utilisateur trouve', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      a_propos: 'Texte portfolio',
    });

    const result = await portfolioService.getAboutByUserId('u1');

    expect(prismaMock.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u1' },
      select: { utilisateur_id: true, a_propos: true },
    });
    expect(result).toEqual({
      ownerId: 'u1',
      about: 'Texte portfolio',
    });
  });

  it('getAboutByUserId retourne null si utilisateur introuvable', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue(null);

    const result = await portfolioService.getAboutByUserId('u404');

    expect(result).toBeNull();
  });

  it('updateUserAboutByUserId met a jour a_propos et retourne la selection attendue', async () => {
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
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        utilisateur_cible_id: 'u2',
        utilisateur_source_id: 'u2',
        type: 'portfolio_update',
      }),
    });
    expect(result).toEqual({
      utilisateur_id: 'u2',
      a_propos: 'Nouveau texte',
    });
  });

  it('getPortfolioEtudiant charge toutes les donnees privees pour le proprietaire', async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue({
      etudiant_utilisateur_id: 'etu-1',
      utilisateur: { nom: 'Doe', prenom: 'Jane' },
      portfolio: { portfolio_id: 'p1' },
      badges: [{ badge_id: 'b1' }],
      clubs: [{ club_id: 'c1' }],
    });
    stageServiceMock.getStagesByEtudiant.mockResolvedValue([{ experience_id: 's1' }]);
    projetServiceMock.getProjetsByEtudiant.mockResolvedValue([{ experience_id: 'p1' }]);
    activiteServiceMock.getActivitesByEtudiant.mockResolvedValue([{ experience_id: 'a1' }]);
    certificationServiceMock.getCertificationsByEtudiant.mockResolvedValue([
      { experience_id: 'c1' },
    ]);

    const result = await portfolioService.getPortfolioEtudiant('etu-1', true);

    expect(stageServiceMock.getStagesByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(projetServiceMock.getProjetsByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(activiteServiceMock.getActivitesByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(certificationServiceMock.getCertificationsByEtudiant).toHaveBeenCalledWith(
      'etu-1'
    );
    expect(result.isOwner).toBe(true);
    expect(result.stages).toHaveLength(1);
    expect(result.projets).toHaveLength(1);
    expect(result.activites).toHaveLength(1);
    expect(result.certifications).toHaveLength(1);
  });

  it('getPortfolioEtudiant charge uniquement les donnees visibles pour un visiteur public', async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue({
      etudiant_utilisateur_id: 'etu-1',
      utilisateur: { nom: 'Doe', prenom: 'Jane' },
      portfolio: null,
      badges: [],
      clubs: [],
    });
    stageServiceMock.getStagesVisiblesByEtudiant.mockResolvedValue([
      { experience_id: 's-visible' },
    ]);
    projetServiceMock.getProjetsVisiblesByEtudiant.mockResolvedValue([
      { experience_id: 'p-visible' },
    ]);
    activiteServiceMock.getActivitesVisiblesByEtudiant.mockResolvedValue([]);
    certificationServiceMock.getCertificationsVisiblesByEtudiant.mockResolvedValue(
      []
    );

    const result = await portfolioService.getPortfolioEtudiant('etu-1', false);

    expect(stageServiceMock.getStagesVisiblesByEtudiant).toHaveBeenCalledWith(
      'etu-1'
    );
    expect(projetServiceMock.getProjetsVisiblesByEtudiant).toHaveBeenCalledWith(
      'etu-1'
    );
    expect(activiteServiceMock.getActivitesVisiblesByEtudiant).toHaveBeenCalledWith(
      'etu-1'
    );
    expect(
      certificationServiceMock.getCertificationsVisiblesByEtudiant
    ).toHaveBeenCalledWith('etu-1');
    expect(result.isOwner).toBe(false);
    expect(result.projets).toEqual([{ experience_id: 'p-visible' }]);
  });

  it('getPortfolioEtudiant refuse un etudiant introuvable', async () => {
    prismaMock.etudiant.findUnique.mockResolvedValue(null);

    await expect(
      portfolioService.getPortfolioEtudiant('etu-missing', false)
    ).rejects.toThrow('Étudiant non trouvé');
  });
});
