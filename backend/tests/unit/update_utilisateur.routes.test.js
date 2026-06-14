import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('update_utilisateur.routes', () => {
  it('declare les vraies routes et middlewares du fichier source', () => {
    const filePath = path.resolve('src/routes/update_utilisateur.routes.js');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain("router.patch('/update-profile/:userId', updatePersonalInformationsController);");
    expect(source).toContain("'/request-professionnel'");
    expect(source).toContain('authMiddleware');
    expect(source).toContain('authorizeRoles(ROLES.ETUDIANT)');
    expect(source).toContain('requestProfessionnelStatusController');
    expect(source).toContain("router.delete('/delete-account', authMiddleware, deleteAccountController);");
  });
});
