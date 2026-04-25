import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// Mock Prisma
vi.mock('../../src/config/prisma.js', () => ({
  default: {
    utilisateur: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    professeur: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock JWT
vi.mock('../../src/config/jwt.js', () => ({
  generateLocalToken: vi.fn(() => 'fake-token'),
}));

import prisma from '../../src/config/prisma.js';
import {
  registerLocalUser,
  loginLocalUser,
} from '../../src/services/auth.service.js';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inscription étudiant', async () => {
    prisma.utilisateur.findUnique.mockResolvedValue(null);

    prisma.utilisateur.create.mockResolvedValue({
      email: 'test@test.com',
      role: 'etudiant',
    });

    const user = await registerLocalUser({
      nom: 'A',
      prenom: 'B',
      email: 'test@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    });

    expect(user.role).toBe('etudiant');
  });

  it('refuse mot de passe incorrect', async () => {
    await expect(
      registerLocalUser({
        nom: 'A',
        prenom: 'B',
        email: 'test@test.com',
        password: '123',
        confirmPassword: '456',
      })
    ).rejects.toThrow();
  });

  it('login correct', async () => {
    const hash = await bcrypt.hash('12345678', 10);

    prisma.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: '1',
      email: 'test@test.com',
      mot_de_passe: hash,
      role: 'etudiant',
      provider: 'local',
    });

    const res = await loginLocalUser({
      email: 'test@test.com',
      password: '12345678',
    });

    expect(res.token).toBe('fake-token');
  });
});