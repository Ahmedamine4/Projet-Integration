import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  utilisateur: {
    findUnique: vi.fn(),
  },
  lettresDeRecommendations: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
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
  TYPES_NOTIFICATION: {
    RECOMMANDATION_DEMANDEE: 'recommandation_demandee',
    COMMENTAIRE_PROJET: 'commentaire_projet',
    PROJET_VALIDE: 'projet_valide',
    STAGE_VALIDE: 'stage_valide',
    RECOMMANDATION_VALIDEE: 'recommandation_validee',
  },
}));

const lettreRecommandationService = await import('../../src/services/lettre_recommandation.service.js');
const professeurService = await import('../../src/services/professeur.service.js');

describe('notification producers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('produit une notification de recommandation a la creation dune demande', async () => {
    prismaMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-user-1',
        nom: 'Prof',
        prenom: 'Ahmed',
        professeur: { prof_utilisateur_id: 'prof-user-1' },
      })
      .mockResolvedValueOnce({
        nom: 'Etu',
        prenom: 'Test',
      });
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue(null);
    prismaMock.lettresDeRecommendations.create.mockResolvedValue({
      objet: 'Lettre Master',
    });

    await lettreRecommandationService.creerDemandeRecommandation('etu-1', {
      objet: 'Lettre Master',
      description: 'Besoin pour candidature',
      email_professeur: 'prof@test.com',
    });

    expect(creerNotificationMock).toHaveBeenNthCalledWith(
      1,
      'prof-user-1',
      expect.stringContaining('Lettre Master'),
      'recommandation_demandee'
    );
  });

  it('produit commentaire_projet', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'proj-1',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      projet: {
        experience: {
          titre: 'Projet IA',
          etudiant: { utilisateur: { utilisateur_id: 'etu-1' } },
        },
      },
    });
    prismaMock.valideProjet.update.mockResolvedValue({ commentaire: 'Ajoute une demo' });

    await professeurService.traiterValidationProjet('prof-1', 'proj-1', undefined, 'Ajoute une demo');

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-1',
      expect.stringContaining('commentaire'),
      'commentaire_projet'
    );
  });

  it('produit projet_valide', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      experience_id: 'proj-2',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      projet: {
        experience: {
          titre: 'Projet API',
          etudiant: { utilisateur: { utilisateur_id: 'etu-2' } },
        },
      },
    });
    prismaMock.valideProjet.update.mockResolvedValue({ statut: 'valide' });

    await professeurService.traiterValidationProjet('prof-1', 'proj-2', 'valide', null);

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-2',
      expect.stringContaining('valid'),
      'projet_valide'
    );
  });

  it('produit stage_valide', async () => {
    prismaMock.valideStage.findUnique.mockResolvedValue({
      experience_id: 'stage-2',
      utilisateur_id: 'prof-1',
      statut: 'en_attente',
      stage: {
        experience: {
          titre: 'Stage Data',
          etudiant: { utilisateur: { utilisateur_id: 'etu-5' } },
        },
      },
    });
    prismaMock.valideStage.update.mockResolvedValue({ statut: 'valide' });

    await professeurService.traiterValidationStageProf('prof-1', 'stage-2', 'valide', null);

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-5',
      expect.stringContaining('valid'),
      'stage_valide'
    );
  });

  it('produit recommandation_validee', async () => {
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      statut: 'en_attente',
      objet: 'Lettre Erasmus',
      etudiant: { utilisateur: { utilisateur_id: 'etu-8' } },
    });
    prismaMock.lettresDeRecommendations.update.mockResolvedValue({ statut: 'valide' });

    await professeurService.traiterLettre(
      'prof-1',
      'etu-8',
      { statut: 'valide', commentaire: null },
      { buffer: Buffer.from('pdf') }
    );

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'etu-8',
      expect.stringContaining('disponible'),
      'recommandation_validee'
    );
  });
});
