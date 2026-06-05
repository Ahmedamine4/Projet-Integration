import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  valideProjet: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  valideStage: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const creerNotificationMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: creerNotificationMock,
}));

const professeurService = await import('../../src/services/professeur.service.js');

describe('professeur.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('autorise un commentaire seul sur un projet en attente', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      experience: {
        titre: 'Projet A',
        etudiant: {
          utilisateur: {
            utilisateur_id: 'etu-1',
          },
        },
      },
    });
    prismaMock.valideProjet.update.mockResolvedValue({
      experience_id: 'exp-1',
      statut: 'en_attente',
      commentaire: 'Peux-tu detailler la demo ?',
    });

    const result = await professeurService.traiterValidationProjet(
      'prof-1',
      'exp-1',
      undefined,
      'Peux-tu detailler la demo ?'
    );

    expect(prismaMock.valideProjet.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: {
        commentaire: 'Peux-tu detailler la demo ?',
        date_d_action: expect.any(Date),
      },
    });
    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('commentaire'),
      'commentaire_projet',
      { utilisateurSourceId: 'prof-1' }
    );
    expect(result.commentaire).toContain('demo');
  });

  it('refuse un refus sans commentaire', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'exp-2',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      experience: {
        titre: 'Projet B',
        etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
      },
    });

    await expect(
      professeurService.traiterValidationProjet('prof-1', 'exp-2', 'refuse', '   ')
    ).rejects.toThrow('Un commentaire est requis pour un refus');
  });

  it('refuse un professeur non assigne', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'exp-3',
      utilisateur_id: 'prof-owner',
      statut: 'en_attente',
      experience: {
        titre: 'Projet C',
        etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
      },
    });

    await expect(
      professeurService.traiterValidationProjet('prof-other', 'exp-3', 'valide', null)
    ).rejects.toThrow('Accès refusé');
  });

  it('refuse un projet deja traite', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'exp-4',
      utilisateur_id: 'prof-1',
      statut: 'valide',
      experience: {
        titre: 'Projet D',
        etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
      },
    });

    await expect(
      professeurService.traiterValidationProjet('prof-1', 'exp-4', 'refuse', 'Trop tard')
    ).rejects.toThrow('déjà été traitée');
  });

  it('valide un stage pour le professeur concerne', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      experience_id: 'stage-1',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      experience: {
        titre: 'Stage A',
        etudiant: {
          utilisateur: {
            utilisateur_id: 'etu-1',
          },
        },
      },
    });
    prismaMock.valideStage.update.mockResolvedValue({
      experience_id: 'stage-1',
      statut: 'valide',
      commentaire: null,
    });

    const result = await professeurService.traiterValidationStageProf(
      'prof-1',
      'stage-1',
      'valide',
      null
    );

    expect(prismaMock.valideStage.update).toHaveBeenCalledWith({
      where: { experience_id: 'stage-1' },
      data: {
        statut: 'valide',
        commentaire: null,
        date_d_action: expect.any(Date),
      },
    });
    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('valid'),
      'validation_stage',
      { utilisateurSourceId: 'prof-1' }
    );
    expect(result.statut).toBe('valide');
  });

  it('refuse un refus de stage sans commentaire', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      experience_id: 'stage-2',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      experience: {
        titre: 'Stage B',
        etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
      },
    });

    await expect(
      professeurService.traiterValidationStageProf('prof-1', 'stage-2', 'refuse', '   ')
    ).rejects.toThrow('Un commentaire est requis pour un refus');
  });
});
