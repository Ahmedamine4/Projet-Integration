import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  experience: {
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  institution: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
  club: {
    findFirst: vi.fn(),
  },
  activite: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  valideActivite: {
    create: vi.fn(),
    update: vi.fn(),
  },
  utilisateur: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(async (callback) => callback(prismaMock)),
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/services/competence.helper.js', () => ({
  lierCompetencesExperience: vi.fn(),
  supprimerCompetencesDeveloppees: vi.fn(),
  getCompetencesByExperience: vi.fn().mockResolvedValue([
    { nom: 'Node.js', type: 'technique' },
  ]),
}));

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: vi.fn(),
  TYPES_NOTIFICATION: {
    VALIDATION_ACTIVITE: 'VALIDATION_ACTIVITE',
  },
}));

vi.mock('../../src/utils/photo.utils.js', () => ({
  uploadPhoto: vi.fn().mockResolvedValue('https://photo.test/image.png'),
  remplacerPhoto: vi.fn().mockResolvedValue('https://photo.test/new.png'),
  supprimerPhoto: vi.fn(),
}));

const service = await import('../../src/services/activite.service.js');
const competenceHelper = await import('../../src/services/competence.helper.js');
const notificationService = await import('../../src/services/notification.service.js');
const photoUtils = await import('../../src/utils/photo.utils.js');

describe('activite.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creeActivite crée une activité personnelle avec photo et compétences', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    prismaMock.experience.create.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Hackathon',
      photo: 'https://photo.test/image.png',
    });

    prismaMock.activite.create.mockResolvedValue({
      experience_id: 'exp-1',
    });

    prismaMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      type: 'hackathon',
      lieu: 'Tanger',
      experience: {
        experience_id: 'exp-1',
        titre: 'Hackathon',
        type_specifique: 'personnel',
      },
      validation: null,
    });

    const result = await service.creeActivite(
      'etu-1',
      {
        titre: 'Hackathon',
        date_experience: '2026-06-10',
        description: 'Participation à un hackathon',
        typeActivite: 'hackathon',
        lieu: 'Tanger',
        is_academique: 'false',
        visibilite: true,
        competences: JSON.stringify([
          { nom: 'Node.js', type: 'technique' },
        ]),
      },
      { originalname: 'photo.png' }
    );

    expect(photoUtils.uploadPhoto).toHaveBeenCalledWith(
      { originalname: 'photo.png' },
      'activites-photos'
    );

    expect(prismaMock.experience.create).toHaveBeenCalled();
    expect(prismaMock.activite.create).toHaveBeenCalled();

    expect(competenceHelper.lierCompetencesExperience).toHaveBeenCalledWith(
      prismaMock,
      'exp-1',
      'etu-1',
      ['Node.js'],
      'technique'
    );

    expect(result.experience.competences).toEqual([
      { nom: 'Node.js', type: 'technique' },
    ]);
  });

  it('creeActivite académique crée validation et notification directeur', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    prismaMock.institution.findFirst.mockResolvedValue({
      institution_id: 'inst-1',
      nom: 'ENSA',
      directeur: {
        directeur_utilisateur_id: 'dir-1',
      },
    });

    prismaMock.experience.create.mockResolvedValue({
      experience_id: 'exp-2',
      titre: 'Club IA',
    });

    prismaMock.activite.create.mockResolvedValue({
      experience_id: 'exp-2',
    });

    prismaMock.valideActivite.create.mockResolvedValue({
      experience_id: 'exp-2',
      institution_id: 'inst-1',
      statut: 'en_attente',
    });

    prismaMock.utilisateur.findUnique.mockResolvedValue({
      nom: 'Sara',
      prenom: 'Zbida',
    });

    prismaMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-2',
      type: 'club',
      experience: {
        experience_id: 'exp-2',
        titre: 'Club IA',
        type_specifique: 'academique',
      },
      validation: {
        statut: 'en_attente',
      },
    });

    await service.creeActivite(
      'etu-1',
      {
        titre: 'Club IA',
        date_experience: '2026-06-10',
        description: 'Activité académique',
        typeActivite: 'club',
        is_academique: 'true',
        nom_institution: 'ENSA',
        competences: JSON.stringify([]),
      },
      null
    );

    expect(prismaMock.valideActivite.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-2',
        institution_id: 'inst-1',
        statut: 'en_attente',
        date_d_action: expect.any(Date),
      },
    });

    expect(notificationService.creerNotification).toHaveBeenCalledWith(
      'dir-1',
      expect.stringContaining('demande la validation de son activité'),
      'VALIDATION_ACTIVITE'
    );
  });

  it('editActivite modifie les compétences et renvoie la validation en attente', async () => {
    prismaMock.experience.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ photo: 'old.png' });

    prismaMock.institution.findFirst.mockResolvedValue({
      institution_id: 'inst-2',
      nom: 'ENSA Tanger',
      directeur: {
        directeur_utilisateur_id: 'dir-2',
      },
    });

    prismaMock.experience.findFirst.mockResolvedValueOnce({
      experience_id: 'exp-3',
      titre: 'Ancienne activité',
      description: 'ancienne description',
      date_experience: new Date('2026-01-01'),
      visibilite: false,
      photo: 'old.png',
      type_specifique: 'academique',
      activite: {
        type: 'club',
        lieu: 'Tanger',
        validation: {
          institution_id: 'inst-1',
          statut: 'en_attente',
        },
      },
    });

    prismaMock.utilisateur.findUnique.mockResolvedValue({
      nom: 'Sara',
      prenom: 'Zbida',
    });

    prismaMock.activite.findUnique.mockResolvedValue({
      experience_id: 'exp-3',
      type: 'club',
      experience: {
        experience_id: 'exp-3',
        titre: 'Nouvelle activité',
      },
      validation: {
        statut: 'en_attente',
      },
    });

    const result = await service.editActivite(
      'etu-1',
      'exp-3',
      {
        titre: 'Nouvelle activité',
        description: 'nouvelle description',
        nom_institution: 'ENSA Tanger',
        competences: JSON.stringify([
          { nom: 'Vue.js', type: 'technique' },
        ]),
      },
      null
    );

    expect(prismaMock.experience.update).toHaveBeenCalled();
    expect(prismaMock.activite.update).toHaveBeenCalled();

    expect(competenceHelper.supprimerCompetencesDeveloppees).toHaveBeenCalledWith(
      prismaMock,
      'exp-3',
      'etu-1'
    );

    expect(competenceHelper.lierCompetencesExperience).toHaveBeenCalledWith(
      prismaMock,
      'exp-3',
      'etu-1',
      ['Vue.js'],
      'technique'
    );

    expect(prismaMock.valideActivite.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-3' },
      data: {
        statut: 'en_attente',
        institution_id: 'inst-2',
        date_d_action: expect.any(Date),
      },
    });

    expect(notificationService.creerNotification).toHaveBeenCalled();

    expect(result.experience.competences).toEqual([
      { nom: 'Node.js', type: 'technique' },
    ]);
  });
});