import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ce mock remplace PrismaClient avant l'import du service.
const { mockFindMany } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      this.institution = {
        findMany: mockFindMany,
      };
    }
  },
}));

const { getInstitutions } = await import('../../src/services/institution.service.js');

describe('institution.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getInstitutions retourne la liste des institutions avec seulement le nom', async () => {
    // Arrange
    mockFindMany.mockResolvedValue([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);

    // Act
    const result = await getInstitutions();

    // Assert
    expect(mockFindMany).toHaveBeenCalledWith({
      select: {
        nom: true,
      },
    });
    expect(result).toEqual([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);
  });
});
