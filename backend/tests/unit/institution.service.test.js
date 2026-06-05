import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  institution: {
    findMany: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

const { getInstitutions } = await import('../../src/services/institution.service.js');

describe('institution.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getInstitutions retourne la liste des institutions avec seulement le nom', async () => {
    // Arrange
    prismaMock.institution.findMany.mockResolvedValue([
      { institution_id: 'inst-1', nom: 'EMSI' },
      { institution_id: 'inst-2', nom: 'ENSA' },
    ]);

    // Act
    const result = await getInstitutions();

    // Assert
    expect(prismaMock.institution.findMany).toHaveBeenCalledWith({
      select: {
        institution_id: true,
        nom: true,
      },
    });
    expect(result).toEqual([
      { institution_id: 'inst-1', nom: 'EMSI' },
      { institution_id: 'inst-2', nom: 'ENSA' },
    ]);
  });
});
