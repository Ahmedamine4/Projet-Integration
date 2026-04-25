import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock service
vi.mock('../../src/services/auth.service.js', () => ({
  findUserByLocalId: vi.fn(),
  findUserBySupabaseUid: vi.fn(),
  syncGoogleUser: vi.fn(),
  sanitizeUser: vi.fn((u) => u),
}));

import {
  findUserByLocalId,
  findUserBySupabaseUid,
} from '../../src/services/auth.service.js';

import {
  authMiddleware,
  authorizeRoles,
  ROLES,
} from '../../src/middlewares/auth.middleware.js';

function resMock() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('auth.middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MY_EXPRESS_SECRET = 'secret';
    process.env.SUPABASE_JWT_SECRET = 'secret2';
  });

  it('refuse sans token', async () => {
    const req = { headers: {} };
    const res = resMock();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepte token local', async () => {
    process.env.MY_EXPRESS_SECRET = 'secret';
    process.env.SUPABASE_JWT_SECRET = 'secret2';

    const token = jwt.sign({ id: '1' }, process.env.MY_EXPRESS_SECRET);

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res = resMock();
    const next = vi.fn();

    findUserByLocalId.mockResolvedValue({
      utilisateur_id: '1',
      email: 'a@test.com',
      role: 'etudiant',
      mot_de_passe: 'hashed',
    });

    await authMiddleware(req, res, next);

    console.log(res.status.mock.calls);
    console.log(res.json.mock.calls);

    expect(next).toHaveBeenCalled();
  });

  it('role admin OK', () => {
    const req = { user: { role: ROLES.ADMIN } };
    const res = resMock();
    const next = vi.fn();

    authorizeRoles(ROLES.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});