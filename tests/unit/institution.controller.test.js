import { beforeEach, describe, expect, it, vi } from 'vitest';

// Le controller depend seulement du service institution.
const institutionServiceMock = {
  getInstitutions: vi.fn(),
};

vi.mock('../../src/services/institution.service.js', () => institutionServiceMock);

const { getInstitution } = await import('../../src/controllers/institution.controller.js');

function createRes() {
  // Faux objet response Express minimal.
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('institution.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getInstitution renvoie 200 avec la liste des institutions', async () => {
    // Arrange
    const req = {};
    const res = createRes();
    institutionServiceMock.getInstitutions.mockResolvedValue([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);

    // Act
    await getInstitution(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);
  });

  it('getInstitution renvoie 500 si le service echoue', async () => {
    // Arrange
    const req = {};
    const res = createRes();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    institutionServiceMock.getInstitutions.mockRejectedValue(new Error('db error'));

    // Act
    await getInstitution(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });

    consoleSpy.mockRestore();
  });
});
