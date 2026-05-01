import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.hoisted permet de creer le mock avant le chargement du module teste.
const { mockFindMany } = vi.hoisted(() => ({
  // Cette fonction remplacera prisma.institution.findMany().
  mockFindMany: vi.fn(),
}));

// Ce mock remplace le package Prisma.
// Mock du package Prisma.
// On remplace PrismaClient par une fausse classe tres simple.
vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      // Le service appellera prisma.institution.findMany(...)
      // donc on prepare exactement cette structure.
      this.institution = {
        findMany: mockFindMany,
      };
    }
  },
}));

import { getInstitutions } from '../../src/services/institution.service.js';

// Cette suite teste uniquement la lecture des institutions depuis Prisma.
describe('institution.service', () => {
  beforeEach(() => {
    // On remet le mock a zero avant chaque test.
    vi.clearAllMocks();
  });

  it('getInstitutions retourne la liste des institutions avec seulement le nom', async () => {
    // On simule la lecture simple des institutions.
    // Le service ne doit demander que le champ "nom".
    mockFindMany.mockResolvedValue([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);

    // On appelle la fonction du service.
    const result = await getInstitutions();

    // On verifie que Prisma ne lit que la colonne utile.
    expect(mockFindMany).toHaveBeenCalledWith({
      select: {
        nom: true,
      },
    });
    // On verifie la valeur retournee par le service.
    expect(result).toEqual([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);
  });
});
