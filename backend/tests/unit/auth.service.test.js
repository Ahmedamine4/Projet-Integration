import { beforeEach, describe, expect, it, vi } from 'vitest';

// Prisma est mocke pour isoler completement le service.
const prismaMock = {
  utilisateur: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
};

const bcryptMock = {
  hash: vi.fn(),
  compare: vi.fn(),
};

const jwtMock = {
  generateLocalToken: vi.fn(),
  generateRefreshToken: vi.fn(),
};

// Le service importe ces modules, donc on les remplace par des mocks simples.
vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

vi.mock('../../src/config/jwt.js', () => jwtMock);

const authService = await import('../../src/services/auth.service.js');

describe('auth.service', () => {
  beforeEach(() => {
    // On repart toujours d'un etat propre entre les tests.
    vi.clearAllMocks();
  });

  it('sanitizeUser supprime mot_de_passe', () => {
    // Arrange
    const user = {
      utilisateur_id: 'u1',
      email: 'user@example.com',
      mot_de_passe: 'secret',
      role: 'etudiant',
    };

    // Act
    const result = authService.sanitizeUser(user);

    // Assert
    expect(result).toEqual({
      utilisateur_id: 'u1',
      email: 'user@example.com',
      role: 'etudiant',
    });
  });

  it('registerLocalUser cree un utilisateur local avec role etudiant', async () => {
    // Arrange
    prismaMock.utilisateur.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue('hashed-password');
    prismaMock.utilisateur.create.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Tester',
      prenom: 'Integration',
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
    });

    // Act
    const result = await authService.registerLocalUser({
      firstName: 'Integration',
      lastName: 'Tester',
      email: 'Integration@Example.com',
      password: 'StrongPass123!',
      role: 'administrateur',
    });

    // Assert
    expect(prismaMock.utilisateur.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nom: 'Tester',
          prenom: 'Integration',
          email: 'integration@example.com',
          mot_de_passe: 'hashed-password',
          role: 'etudiant',
          provider: 'local',
        }),
      })
    );
    expect(result).toMatchObject({
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
    });
  });

  it('registerLocalUser refuse un email deja utilise', async () => {
    // Arrange
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'integration@example.com',
    });

    // Act / Assert
    await expect(
      authService.registerLocalUser({
        firstName: 'Integration',
        lastName: 'Tester',
        email: 'integration@example.com',
        password: 'StrongPass123!',
      })
    ).rejects.toThrow('Email');
  });

  it('registerLocalUser refuse des champs invalides', async () => {
    // Act / Assert
    await expect(
      authService.registerLocalUser({
        firstName: '',
        lastName: '',
        email: 'email-invalide',
        password: '123',
      })
    ).rejects.toThrow();
  });

  it('loginLocalUser renvoie le user sanitize, un token et un refreshToken', async () => {
    // Arrange
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u2',
      nom: 'Tester',
      prenom: 'Integration',
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
      mot_de_passe: 'hashed-password',
    });
    bcryptMock.compare.mockResolvedValue(true);
    jwtMock.generateLocalToken.mockReturnValue('access-token');
    jwtMock.generateRefreshToken.mockReturnValue('refresh-token');

    // Act
    const result = await authService.loginLocalUser({
      email: 'integration@example.com',
      password: 'StrongPass123!',
    });

    // Assert
    // Le service renvoie encore la cle "token".
    // C'est ensuite le controller qui pose ce token dans le cookie "accessToken".
    expect(jwtMock.generateLocalToken).toHaveBeenCalledWith({
      id: 'u2',
      email: 'integration@example.com',
      role: 'etudiant',
    });
    expect(jwtMock.generateRefreshToken).toHaveBeenCalledWith({
      id: 'u2',
    });
    expect(result).toEqual({
      user: {
        utilisateur_id: 'u2',
        nom: 'Tester',
        prenom: 'Integration',
        email: 'integration@example.com',
        role: 'etudiant',
        provider: 'local',
      },
      token: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('loginLocalUser refuse un email inexistant', async () => {
    // Arrange
    prismaMock.utilisateur.findUnique.mockResolvedValue(null);

    // Act / Assert
    await expect(
      authService.loginLocalUser({
        email: 'missing@example.com',
        password: 'StrongPass123!',
      })
    ).rejects.toThrow('incorrect');
  });

  it('loginLocalUser refuse un mauvais mot de passe', async () => {
    // Arrange
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u2',
      email: 'integration@example.com',
      provider: 'local',
      mot_de_passe: 'hashed-password',
    });
    bcryptMock.compare.mockResolvedValue(false);

    // Act / Assert
    await expect(
      authService.loginLocalUser({
        email: 'integration@example.com',
        password: 'WrongPass123!',
      })
    ).rejects.toThrow('incorrect');
  });

  it('syncGoogleUser cree un user google avec mot_de_passe null si user inexistant', async () => {
    // Arrange
    prismaMock.utilisateur.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prismaMock.utilisateur.create.mockResolvedValue({
      utilisateur_id: 'g1',
      nom: 'User',
      prenom: 'Google',
      email: 'google@example.com',
      role: 'etudiant',
      provider: 'google',
    });

    // Act
    const result = await authService.syncGoogleUser({
      sub: 'google-sub-1',
      email: 'google@example.com',
      user_metadata: {
        given_name: 'Google',
        family_name: 'User',
      },
    });

    // Assert
    expect(prismaMock.utilisateur.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: 'google',
          supabase_uid: 'google-sub-1',
          role: 'etudiant',
          email: 'google@example.com',
        }),
      })
    );
    expect(result).toMatchObject({
      email: 'google@example.com',
      provider: 'google',
    });
  });
});
