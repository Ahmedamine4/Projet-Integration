import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  getFeedTechnologiesDomaines: vi.fn(),
  getFeedOffres: vi.fn(),
  getFeedSuggestions: vi.fn(),
  getFeedExperiences: vi.fn(),
  envoyerDemande: vi.fn(),
};

vi.mock('../../src/services/feed.service.js', () => serviceMock);

const controller = await import('../../src/controllers/feed.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('feed.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getFeedTechnologiesAndDomaines retourne les filtres', async () => {
    serviceMock.getFeedTechnologiesDomaines.mockResolvedValue({ technologies: [], domaines: [] });
    const res = createRes();

    await controller.getFeedTechnologiesAndDomaines({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getOffresFeed transmet userId et pagination', async () => {
    serviceMock.getFeedOffres.mockResolvedValue({ data: [], page: 1 });
    const req = { user: { utilisateur_id: 'etu-1' }, query: { page: '1', limit: '5' } };
    const res = createRes();

    await controller.getOffresFeed(req, res);

    expect(serviceMock.getFeedOffres).toHaveBeenCalledWith('etu-1', { page: '1', limit: '5' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getSuggestionsFeed retourne 500 si le service echoue', async () => {
    serviceMock.getFeedSuggestions.mockRejectedValue(new Error('boom'));
    const req = { user: { utilisateur_id: 'etu-1' }, query: {} };
    const res = createRes();

    await controller.getSuggestionsFeed(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getExperiencesFeed transmet les filtres du feed', async () => {
    serviceMock.getFeedExperiences.mockResolvedValue({ data: [] });
    const req = {
      user: { utilisateur_id: 'etu-1' },
      query: { technologie: 'React', domaine: 'Web', meme_ecole: 'true', following: 'false', trending: 'true' },
    };
    const res = createRes();

    await controller.getExperiencesFeed(req, res);

    expect(serviceMock.getFeedExperiences).toHaveBeenCalledWith('etu-1', {
      page: undefined,
      limit: undefined,
      technologie: 'React',
      domaine: 'Web',
      meme_ecole: 'true',
      following: 'false',
      trending: 'true',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('envoyerDemandeController retourne 400 sur erreur service', async () => {
    serviceMock.envoyerDemande.mockRejectedValue(new Error('demande invalide'));
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { offreId: 'offre-1' },
      body: { message: 'Bonjour' },
    };
    const res = createRes();

    await controller.envoyerDemandeController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
