import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  connexion: {
    create: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

const parseSessionInfoMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/utils/session.utils.js', () => ({
  parseSessionInfo: parseSessionInfoMock,
}));

const service = await import('../../src/services/session.service.js');

describe('session.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    parseSessionInfoMock.mockReturnValue({
      browser: 'Chrome',
      browser_version: '120',
      device_type: 'desktop',
      os: 'Windows',
      ip: '127.0.0.1',
      ville: 'Tanger',
      pays: 'Maroc',
    });
  });

  it('creerSession cree une session avec les infos parsees depuis req', async () => {
    const req = { headers: {}, ip: '127.0.0.1' };

    prismaMock.connexion.create.mockResolvedValue({
      connexion_id: 'conn-1',
      utilisateur_id: 'user-1',
      session_token: 'session-token',
    });

    const result = await service.creerSession('user-1', req);

    expect(parseSessionInfoMock).toHaveBeenCalledWith(req);
    expect(prismaMock.connexion.create).toHaveBeenCalledWith({
      data: {
        utilisateur_id: 'user-1',
        session_token: expect.any(String),
        browser: 'Chrome',
        browser_version: '120',
        device_type: 'desktop',
        os: 'Windows',
        ip: '127.0.0.1',
        ville: 'Tanger',
        pays: 'Maroc',
        is_current: true,
        expires_at: expect.any(Date),
      },
    });

    expect(result.connexion_id).toBe('conn-1');
  });

  it('fermerSession desactive une session par token', async () => {
    prismaMock.connexion.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.fermerSession('session-token');

    expect(prismaMock.connexion.updateMany).toHaveBeenCalledWith({
      where: { session_token: 'session-token' },
      data: {
        is_current: false,
        last_active: expect.any(Date),
        date_deconnexion: expect.any(Date),
      },
    });
    expect(result).toEqual({ count: 1 });
  });

  it('fermerSession retourne null si updateMany echoue', async () => {
    prismaMock.connexion.updateMany.mockRejectedValue(new Error('not found'));

    const result = await service.fermerSession('bad-token');

    expect(result).toBeNull();
  });

  it('fermerAutresSessions desactive les autres sessions actives', async () => {
    prismaMock.connexion.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.fermerAutresSessions('user-1', 'current-token');

    expect(prismaMock.connexion.updateMany).toHaveBeenCalledWith({
      where: {
        utilisateur_id: 'user-1',
        session_token: { not: 'current-token' },
        is_current: true,
      },
      data: {
        is_current: false,
        last_active: expect.any(Date),
        date_deconnexion: expect.any(Date),
      },
    });

    expect(result).toEqual({ count: 2 });
  });

  it('getSessionsActives desactive les expirees puis retourne les sessions actives', async () => {
    const sessions = [
      {
        connexion_id: 'conn-1',
        utilisateur_id: 'user-1',
        session_token: 'token-1',
      },
    ];

    prismaMock.connexion.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.connexion.findMany.mockResolvedValue(sessions);

    const result = await service.getSessionsActives('user-1');

    expect(prismaMock.connexion.updateMany).toHaveBeenCalledWith({
      where: {
        utilisateur_id: 'user-1',
        expires_at: { lt: expect.any(Date) },
      },
      data: {
        is_current: false,
        date_deconnexion: expect.any(Date),
      },
    });

    expect(prismaMock.connexion.findMany).toHaveBeenCalledWith({
      where: { utilisateur_id: 'user-1', is_current: true },
      orderBy: { date_connexion: 'desc' },
    });

    expect(result).toEqual(sessions);
  });

  it('getAllSessions retourne les evenements login/logout avec pagination par defaut', async () => {
    const sessions = [
      {
        connexion_id: 'conn-1',
        date_connexion: new Date('2026-01-01T10:00:00Z'),
        date_deconnexion: null,
        utilisateur: { nom: 'Nom', prenom: 'Prenom', email: 'u@test.com', role: 'etudiant' },
      },
      {
        connexion_id: 'conn-2',
        date_connexion: new Date('2026-01-02T10:00:00Z'),
        date_deconnexion: new Date('2026-01-02T12:00:00Z'),
        utilisateur: { nom: 'Nom2', prenom: 'Prenom2', email: 'u2@test.com', role: 'professeur' },
      },
    ];

    prismaMock.connexion.findMany.mockResolvedValue(sessions);
    prismaMock.connexion.count.mockResolvedValue(2);

    const result = await service.getAllSessions();

    expect(prismaMock.connexion.findMany).toHaveBeenCalledWith({
      orderBy: { date_connexion: 'desc' },
      skip: 0,
      take: 50,
      include: {
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
      },
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.total).toBe(3);
    expect(result.sessions).toHaveLength(3);
    expect(result.sessions[0].action).toBe('LOGOUT');
  });

  it('getAllSessions applique page et limit', async () => {
    prismaMock.connexion.findMany.mockResolvedValue([]);
    prismaMock.connexion.count.mockResolvedValue(25);

    const result = await service.getAllSessions({
      page: 3,
      limit: 10,
    });

    expect(prismaMock.connexion.findMany).toHaveBeenCalledWith({
      orderBy: { date_connexion: 'desc' },
      skip: 20,
      take: 10,
      include: {
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
      },
    });

    expect(result).toEqual({
      sessions: [],
      total: 0,
      page: 3,
      limit: 10,
    });
  });
});
