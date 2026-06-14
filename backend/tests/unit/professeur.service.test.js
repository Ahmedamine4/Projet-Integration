import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  valideProjet: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  valideStage: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  lettresDeRecommendations: {
    findMany: vi.fn(),
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
  TYPES_NOTIFICATION: {
    COMMENTAIRE_PROJET: 'commentaire_projet',
    COMMENTAIRE_STAGE: 'commentaire_stage',
    PROJET_VALIDE: 'projet_valide',
    PROJET_REFUSE: 'projet_refuse',
    STAGE_VALIDE: 'stage_valide',
    STAGE_REFUSE: 'stage_refuse',
    COMMENTAIRE_RECOMMANDATION: 'commentaire_recommandation',
    RECOMMANDATION_REFUSEE: 'recommandation_refusee',
    RECOMMANDATION_VALIDEE: 'recommandation_validee',
  },
}));

const professeurService = await import('../../src/services/professeur.service.js');

describe('professeur.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDemandes retourne stages projets et recommandations tries avec pagination', async () => {
    prismaMock.valideStage.findMany.mockResolvedValue([
      {
        statut: 'en_attente',
        date_d_action: new Date('2026-01-01'),
        experience_id: 'stage-1',
        commentaire: null,
        experience: {
          titre: 'Stage A',
          etudiant: { utilisateur: { nom: 'Zbida', prenom: 'Sara' } },
        },
      },
    ]);

    prismaMock.valideProjet.findMany.mockResolvedValue([
      {
        statut: 'valide',
        date_d_action: new Date('2026-01-03'),
        experience_id: 'projet-1',
        commentaire: 'ok',
        experience: {
          titre: 'Projet A',
          etudiant: { utilisateur: { nom: 'Ali', prenom: 'Omar' } },
        },
      },
    ]);

    prismaMock.lettresDeRecommendations.findMany.mockResolvedValue([
      {
        statut: 'refuse',
        date_lettre: new Date('2026-01-02'),
        objet: 'Lettre Master',
        commentaire: 'non',
        etudiant: { utilisateur: { nom: 'Bennis', prenom: 'Aya' } },
      },
    ]);

    const result = await professeurService.getDemandes('prof-1', {
      page: '1',
    });

    expect(result.pagination).toEqual({
      page: 1,
      totalPages: 1,
      total: 3,
      pageSize: 10,
    });

    expect(result.data.map((d) => d.type)).toEqual([
      'projet',
      'recommandation',
      'stage',
    ]);
  });

  it('getDemandes filtre uniquement les stages', async () => {
    prismaMock.valideStage.findMany.mockResolvedValue([]);

    const result = await professeurService.getDemandes('prof-1', {
      type: 'stage',
      statut: 'en_attente',
      page: '2',
    });

    expect(prismaMock.valideStage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          utilisateur_id: 'prof-1',
          statut: 'en_attente',
        },
      })
    );

    expect(prismaMock.valideProjet.findMany).not.toHaveBeenCalled();
    expect(prismaMock.lettresDeRecommendations.findMany).not.toHaveBeenCalled();

    expect(result.pagination.page).toBe(2);
  });

  it('getStageById retourne le stage si professeur autorise', async () => {
    const stage = {
      experience_id: 'stage-1',
      utilisateur_id: 'prof-1',
    };

    prismaMock.valideStage.findUnique.mockResolvedValue(stage);

    const result = await professeurService.getStageById('prof-1', 'stage-1');

    expect(prismaMock.valideStage.findUnique).toHaveBeenCalledWith({
      where: { experience_id: 'stage-1' },
      include: {
        stage: {
          include: {
            experience: {
              include: {
                etudiant: { include: { utilisateur: true } },
                competence_dev: { include: { competence: true } },
              },
            },
          },
        },
      },
    });

    expect(result).toEqual(stage);
  });

  it('getStageById retourne erreur si stage introuvable', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue(null);

    await expect(
      professeurService.getStageById('prof-1', 'stage-1')
    ).rejects.toThrow('Stage non trouvé');
  });

  it('getStageById retourne erreur si acces refuse', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      experience_id: 'stage-1',
      utilisateur_id: 'prof-2',
    });

    await expect(
      professeurService.getStageById('prof-1', 'stage-1')
    ).rejects.toThrow('Accès refusé');
  });

  it('getProjetById retourne le projet si professeur autorise', async () => {
    const projet = {
      experience_id: 'projet-1',
      utilisateur_id: 'prof-1',
    };

    prismaMock.valideProjet.findUnique.mockResolvedValue(projet);

    const result = await professeurService.getProjetById('prof-1', 'projet-1');

    expect(prismaMock.valideProjet.findUnique).toHaveBeenCalledWith({
      where: { experience_id: 'projet-1' },
      include: {
        projet: {
          include: {
            experience: {
              include: {
                etudiant: { include: { utilisateur: true } },
                competence_dev: { include: { competence: true } },
              },
            },
          },
        },
      },
    });

    expect(result).toEqual(projet);
  });

  it('getProjetById retourne erreur si projet introuvable', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue(null);

    await expect(
      professeurService.getProjetById('prof-1', 'projet-1')
    ).rejects.toThrow('Projet non trouvé');
  });

  it('getProjetById retourne erreur si acces refuse', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'projet-1',
      utilisateur_id: 'prof-2',
    });

    await expect(
      professeurService.getProjetById('prof-1', 'projet-1')
    ).rejects.toThrow('Accès refusé');
  });

  it('autorise un commentaire seul sur un projet en attente', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      projet: {
        experience: {
          titre: 'Projet A',
          etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
        },
      },
    });

    prismaMock.valideProjet.update.mockResolvedValue({
      experience_id: 'exp-1',
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
      'commentaire_projet'
    );

    expect(result.commentaire).toContain('demo');
  });

  it('traiterValidationProjet refuse si demande introuvable', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue(null);

    await expect(
      professeurService.traiterValidationProjet('prof-1', 'exp-1', 'valide')
    ).rejects.toThrow('Demande de validation non trouvée');
  });

  it('traiterValidationProjet refuse si acces refuse', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-2',
      statut: 'en_attente',
    });

    await expect(
      professeurService.traiterValidationProjet('prof-1', 'exp-1', 'valide')
    ).rejects.toThrow('Accès refusé');
  });

  it('traiterValidationProjet refuse si deja traitee', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'valide',
    });

    await expect(
      professeurService.traiterValidationProjet('prof-1', 'exp-1', 'valide')
    ).rejects.toThrow('Cette demande a déjà été traitée');
  });

  it('traiterValidationProjet refuse commentaire vide sans statut', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
    });

    await expect(
      professeurService.traiterValidationProjet('prof-1', 'exp-1', undefined, ' ')
    ).rejects.toThrow('Un commentaire est requis');
  });

  it('traiterValidationProjet refuse refus sans commentaire', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
    });

    await expect(
      professeurService.traiterValidationProjet('prof-1', 'exp-1', 'refuse', ' ')
    ).rejects.toThrow('Un commentaire est requis pour un refus');
  });

  it('traiterValidationProjet valide un projet', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      projet: {
        experience: {
          titre: 'Projet A',
          etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
        },
      },
    });

    prismaMock.valideProjet.update.mockResolvedValue({
      statut: 'valide',
      commentaire: null,
    });

    const result = await professeurService.traiterValidationProjet(
      'prof-1',
      'exp-1',
      'valide',
      null
    );

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('validé'),
      'projet_valide'
    );

    expect(result.statut).toBe('valide');
  });

  it('traiterValidationProjet refuse un projet avec commentaire', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      projet: {
        experience: {
          titre: 'Projet A',
          etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
        },
      },
    });

    prismaMock.valideProjet.update.mockResolvedValue({
      statut: 'refuse',
      commentaire: 'Manque demo',
    });

    const result = await professeurService.traiterValidationProjet(
      'prof-1',
      'exp-1',
      'refuse',
      'Manque demo'
    );

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('refusé'),
      'projet_refuse'
    );

    expect(result.statut).toBe('refuse');
  });

  it('valide un stage pour le professeur concerne', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      experience_id: 'stage-1',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      stage: {
        experience: {
          titre: 'Stage A',
          etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
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

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('validé'),
      'stage_valide'
    );

    expect(result.statut).toBe('valide');
  });

  it('traiterValidationStageProf refuse si demande introuvable', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue(null);

    await expect(
      professeurService.traiterValidationStageProf('prof-1', 'stage-1', 'valide')
    ).rejects.toThrow('Demande de validation non trouvée');
  });

  it('traiterValidationStageProf refuse si acces refuse', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-2',
      statut: 'en_attente',
    });

    await expect(
      professeurService.traiterValidationStageProf('prof-1', 'stage-1', 'valide')
    ).rejects.toThrow('Accès refusé');
  });

  it('traiterValidationStageProf refuse si deja traitee', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'refuse',
    });

    await expect(
      professeurService.traiterValidationStageProf('prof-1', 'stage-1', 'valide')
    ).rejects.toThrow('Cette demande a déjà été traitée');
  });

  it('traiterValidationStageProf ajoute un commentaire seul', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      stage: {
        experience: {
          titre: 'Stage A',
          etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
        },
      },
    });

    prismaMock.valideStage.update.mockResolvedValue({
      commentaire: 'Corrige la description',
    });

    const result = await professeurService.traiterValidationStageProf(
      'prof-1',
      'stage-1',
      undefined,
      'Corrige la description'
    );

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('commentaire'),
      'commentaire_stage'
    );

    expect(result.commentaire).toContain('Corrige');
  });

  it('traiterValidationStageProf refuse commentaire vide sans statut', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
    });

    await expect(
      professeurService.traiterValidationStageProf('prof-1', 'stage-1', undefined, ' ')
    ).rejects.toThrow('Un commentaire est requis');
  });

  it('traiterValidationStageProf refuse refus sans commentaire', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
    });

    await expect(
      professeurService.traiterValidationStageProf('prof-1', 'stage-1', 'refuse', ' ')
    ).rejects.toThrow('Un commentaire est requis pour un refus');
  });

  it('traiterValidationStageProf refuse un stage avec commentaire', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      stage: {
        experience: {
          titre: 'Stage A',
          etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
        },
      },
    });

    prismaMock.valideStage.update.mockResolvedValue({
      statut: 'refuse',
      commentaire: 'Manque attestation',
    });

    const result = await professeurService.traiterValidationStageProf(
      'prof-1',
      'stage-1',
      'refuse',
      'Manque attestation'
    );

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('refusé'),
      'stage_refuse'
    );

    expect(result.statut).toBe('refuse');
  });

  it('getLettreById retourne la lettre', async () => {
    const lettre = {
      objet: 'Lettre Master',
    };

    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue(lettre);

    const result = await professeurService.getLettreById('prof-1', 'etu-1');

    expect(result).toEqual(lettre);
  });

  it('getLettreById refuse si demande introuvable', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue(null);

    await expect(
      professeurService.getLettreById('prof-1', 'etu-1')
    ).rejects.toThrow('Demande non trouvée');
  });

  it('traiterLettre refuse si demande introuvable', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue(null);

    await expect(
      professeurService.traiterLettre('prof-1', 'etu-1', {
        statut: 'valide',
      })
    ).rejects.toThrow('Demande non trouvée');
  });

  it('traiterLettre refuse si demande deja validee', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'valide',
    });

    await expect(
      professeurService.traiterLettre('prof-1', 'etu-1', {
        statut: 'valide',
      })
    ).rejects.toThrow('Cette demande a déjà été traitée');
  });

  it('traiterLettre ajoute un commentaire seul', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
      objet: 'Lettre Master',
    });

    prismaMock.lettresDeRecommendations.update.mockResolvedValue({
      commentaire: 'Ajoute tes notes',
    });

    const result = await professeurService.traiterLettre(
      'prof-1',
      'etu-1',
      { commentaire: 'Ajoute tes notes' }
    );

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('commentaire'),
      'commentaire_recommandation'
    );

    expect(result.commentaire).toContain('notes');
  });

  it('traiterLettre refuse commentaire vide sans statut', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
    });

    await expect(
      professeurService.traiterLettre('prof-1', 'etu-1', {
        commentaire: ' ',
      })
    ).rejects.toThrow('Un commentaire est requis');
  });

  it('refuse un refus de recommandation sans commentaire', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
      objet: 'Lettre',
      etudiant: { utilisateur: { utilisateur_id: 'etu-7' } },
    });

    await expect(
      professeurService.traiterLettre('prof-1', 'etu-7', {
        statut: 'refuse',
        commentaire: '   ',
      })
    ).rejects.toThrow('commentaire');
  });

  it('traiterLettre refuse une recommandation avec commentaire', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
      objet: 'Lettre Erasmus',
    });

    prismaMock.lettresDeRecommendations.update.mockResolvedValue({
      statut: 'refuse',
      commentaire: 'Pas assez d informations',
    });

    const result = await professeurService.traiterLettre(
      'prof-1',
      'etu-1',
      {
        statut: 'refuse',
        commentaire: 'Pas assez d informations',
      }
    );

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('refusée'),
      'recommandation_refusee'
    );

    expect(result.statut).toBe('refuse');
  });

  it('traiterLettre refuse validation sans fichier PDF', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
      objet: 'Lettre Erasmus',
    });

    await expect(
      professeurService.traiterLettre('prof-1', 'etu-1', {
        statut: 'valide',
      })
    ).rejects.toThrow('Un fichier PDF est requis pour valider');
  });

  it('valide une lettre avec un PDF et notifie letudiant', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
      objet: 'Lettre Erasmus',
      etudiant: { utilisateur: { utilisateur_id: 'etu-8' } },
    });

    prismaMock.lettresDeRecommendations.update.mockResolvedValue({
      statut: 'valide',
    });

    await professeurService.traiterLettre(
      'prof-1',
      'etu-8',
      { statut: 'valide', commentaire: null },
      { buffer: Buffer.from('pdf') }
    );

    expect(prismaMock.lettresDeRecommendations.update).toHaveBeenCalledWith({
      where: {
        utilisateur_id_prof_utilisateur_id: {
          utilisateur_id: 'etu-8',
          prof_utilisateur_id: 'prof-1',
        },
      },
      data: {
        statut: 'valide',
        fichier: expect.stringContaining('data:application/pdf;base64,'),
        commentaire: null,
      },
    });

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-8',
      expect.stringContaining('disponible'),
      'recommandation_validee'
    );
  });

  it('traiterLettre refuse statut invalide', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
      objet: 'Lettre Erasmus',
    });

    await expect(
      professeurService.traiterLettre('prof-1', 'etu-1', {
        statut: 'bad',
      })
    ).rejects.toThrow('Statut invalide');
  });
});
