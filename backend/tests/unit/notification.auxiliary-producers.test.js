import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  utilisateur: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  follow: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  experience: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

const bcryptMock = {
  compare: vi.fn(),
  genSalt: vi.fn(),
  hash: vi.fn(),
};

const creerNotificationMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: creerNotificationMock,
  TYPES_NOTIFICATION: {
    NOUVEAU_FOLLOWER: 'nouveau_follower',
  },
}));

const followService = await import('../../src/services/follow.service.js');
const socialMediaService = await import('../../src/services/social_media.service.js');
const updateUtilisateurService = await import('../../src/services/update_utilisateur.service.js');
const certificationService = await import('../../src/services/certification.service.js');

describe('auxiliary notification coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('followUser produit nouveau_follower', async () => {
    prismaMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'user-2',
        nom: 'Target',
        prenom: 'User',
      })
      .mockResolvedValueOnce({
        nom: 'Follow',
        prenom: 'Alice',
      });
    prismaMock.follow.findUnique.mockResolvedValue(null);
    prismaMock.follow.create.mockResolvedValue({
      followerId: 'user-1',
      followingId: 'user-2',
    });

    await followService.followUser('user-1', 'user-2');

    expect(creerNotificationMock).toHaveBeenCalledWith(
      'user-2',
      expect.stringContaining('a commenc'),
      'nouveau_follower'
    );
  });

  it('updateSocialMedia met simplement a jour les liens sans notification', async () => {
    prismaMock.utilisateur.update.mockResolvedValue({
      github: 'https://github.com/demo',
      instagram: null,
      x: null,
      linkedin: null,
    });

    await socialMediaService.updateSocialMedia('user-1', {
      github: ' https://github.com/demo ',
    });

    expect(prismaMock.utilisateur.update).toHaveBeenCalled();
    expect(creerNotificationMock).not.toHaveBeenCalled();
  });

  it('updateNom met a jour le profil sans notification', async () => {
    prismaMock.utilisateur.update.mockResolvedValue({
      utilisateur_id: 'user-1',
      nom: 'Nouveau',
    });

    await updateUtilisateurService.updateNom('user-1', 'Nouveau');

    expect(prismaMock.utilisateur.update).toHaveBeenCalled();
    expect(creerNotificationMock).not.toHaveBeenCalled();
  });

  it('updateVisibiliteCertificationService met a jour la visibilite sans notification', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      utilisateur_id: 'etu-1',
      type: 'certification',
      titre: 'AWS',
    });
    prismaMock.experience.update.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: true,
    });

    await certificationService.updateVisibiliteCertificationService('etu-1', 'exp-1', true);

    expect(prismaMock.experience.update).toHaveBeenCalled();
    expect(creerNotificationMock).not.toHaveBeenCalled();
  });
});
