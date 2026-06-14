import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  uploadUserProfilePhoto: vi.fn(),
  getUserProfilePhotoByUserId: vi.fn(),
};

vi.mock('../../src/services/photo.service.js', () => serviceMock);

const controller = await import('../../src/controllers/photo.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('photo.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadProfilePhotoController retourne 401 si utilisateur non connecte', async () => {
    const res = createRes();
    await controller.uploadProfilePhotoController({ params: { id: 'u1' }, user: null }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('uploadProfilePhotoController retourne 403 si non proprietaire', async () => {
    const res = createRes();
    await controller.uploadProfilePhotoController({
      params: { id: 'u1' },
      user: { utilisateur_id: 'u2' },
    }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('uploadProfilePhotoController retourne 400 sans fichier', async () => {
    const res = createRes();
    await controller.uploadProfilePhotoController({
      params: { id: 'u1' },
      user: { utilisateur_id: 'u1' },
      file: null,
    }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('uploadProfilePhotoController charge la photo', async () => {
    serviceMock.uploadUserProfilePhoto.mockResolvedValue({ photo: 'https://example.com/photo.jpg' });
    const res = createRes();
    await controller.uploadProfilePhotoController({
      params: { id: 'u1' },
      user: { utilisateur_id: 'u1' },
      file: { originalname: 'photo.jpg' },
    }, res);
    expect(serviceMock.uploadUserProfilePhoto).toHaveBeenCalledWith('u1', { originalname: 'photo.jpg' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfilePhotoController retourne 404 si utilisateur introuvable', async () => {
    serviceMock.getUserProfilePhotoByUserId.mockResolvedValue(null);
    const res = createRes();
    await controller.getProfilePhotoController({ params: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getProfilePhotoController retourne 500 sur erreur service', async () => {
    serviceMock.getUserProfilePhotoByUserId.mockRejectedValue(new Error('boom'));
    const res = createRes();
    await controller.getProfilePhotoController({ params: { id: 'u1' } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
