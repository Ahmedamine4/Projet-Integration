import { beforeEach, describe, expect, it, vi } from 'vitest';

const portfolioServiceMock = {
  getAboutByUserId: vi.fn(),
  updateUserAboutByUserId: vi.fn(),
};

const authServiceMock = {
  findUserByLocalId: vi.fn(),
  findUserBySupabaseUid: vi.fn(),
  syncGoogleUser: vi.fn(),
};

const jwtMock = {
  verify: vi.fn(),
};

vi.mock('../../src/services/portfolio.service.js', () => portfolioServiceMock);
vi.mock('../../src/services/auth.service.js', () => authServiceMock);
vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

const { getAbout, updateAbout } = await import(
  '../../src/controllers/portfolio.controller.js'
);

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('portfolio.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAbout retourne about null si le portfolio est introuvable', async () => {
    portfolioServiceMock.getAboutByUserId.mockResolvedValue(null);
    const req = {
      params: { id: 'u404' },
      cookies: {},
    };
    const res = createRes();

    await getAbout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      about: null,
      ownerId: null,
      isOwner: false,
    });
  });

  it('getAbout retourne isOwner true pour le proprietaire local', async () => {
    portfolioServiceMock.getAboutByUserId.mockResolvedValue({
      ownerId: 'u1',
      about: 'Bonjour\\nmonde',
    });
    jwtMock.verify.mockReturnValue({ id: 'u1' });
    authServiceMock.findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
    });

    const req = {
      params: { id: 'u1' },
      cookies: { accessToken: 'token-local' },
    };
    const res = createRes();

    await getAbout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      about: 'Bonjour\nmonde',
      ownerId: 'u1',
      isOwner: true,
    });
  });

  it('getAbout bascule sur le flux supabase si le token local est invalide', async () => {
    portfolioServiceMock.getAboutByUserId.mockResolvedValue({
      ownerId: 'u2',
      about: 'Texte',
    });
    jwtMock.verify
      .mockImplementationOnce(() => {
        throw new Error('invalid local token');
      })
      .mockImplementationOnce(() => ({ sub: 'supabase-1' }));
    authServiceMock.findUserBySupabaseUid.mockResolvedValue(null);
    authServiceMock.syncGoogleUser.mockResolvedValue({
      utilisateur_id: 'u2',
    });

    const req = {
      params: { id: 'u2' },
      cookies: { accessToken: 'token-supabase' },
    };
    const res = createRes();

    await getAbout(req, res);

    expect(authServiceMock.syncGoogleUser).toHaveBeenCalledWith({
      sub: 'supabase-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      about: 'Texte',
      ownerId: 'u2',
      isOwner: true,
    });
  });

  it('updateAbout retourne 401 sans utilisateur connecte', async () => {
    const req = {
      params: { id: 'u1' },
      user: null,
      body: { a_propos: 'Texte' },
    };
    const res = createRes();

    await updateAbout(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Utilisateur non connecté',
    });
  });

  it('updateAbout retourne 403 si le demandeur nest pas le proprietaire', async () => {
    const req = {
      params: { id: 'u1' },
      user: { utilisateur_id: 'u2' },
      body: { a_propos: 'Texte' },
    };
    const res = createRes();

    await updateAbout(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Accès refusé: non propriétaire',
    });
  });

  it('updateAbout nettoie a_propos puis retourne 200', async () => {
    portfolioServiceMock.updateUserAboutByUserId.mockResolvedValue({
      utilisateur_id: 'u1',
      a_propos: 'Bonjour\nmonde',
    });

    const req = {
      params: { id: 'u1' },
      user: { utilisateur_id: 'u1' },
      body: { a_propos: '  <b>Bonjour</b>\\n\\n\\n monde  ' },
    };
    const res = createRes();

    await updateAbout(req, res);

    expect(portfolioServiceMock.updateUserAboutByUserId).toHaveBeenCalledWith(
      'u1',
      'Bonjour\n\nmonde'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      updated: {
        utilisateur_id: 'u1',
        a_propos: 'Bonjour\nmonde',
      },
    });
  });
});
