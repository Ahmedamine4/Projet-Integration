import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  getProfFeedStudentsTop: vi.fn(),
  getProfFeedSuggestions: vi.fn(),
  getProfFeedExperiences: vi.fn(),
  getProfFeedTags: vi.fn(),
};

vi.mock('../../src/services/feed.prof.service.js', () => serviceMock);

const controller = await import('../../src/controllers/feed.prof.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('feed.prof.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProfFeedTagsController retourne les tags', async () => {
    serviceMock.getProfFeedTags.mockResolvedValue({ technologies: [] });
    const res = createRes();

    await controller.getProfFeedTagsController({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfFeedStudentsTopController transmet profId et pagination', async () => {
    serviceMock.getProfFeedStudentsTop.mockResolvedValue({ data: [] });
    const req = { user: { utilisateur_id: 'prof-1' }, query: { page: '1', limit: '5' } };
    const res = createRes();

    await controller.getProfFeedStudentsTopController(req, res);

    expect(serviceMock.getProfFeedStudentsTop).toHaveBeenCalledWith('prof-1', { page: '1', limit: '5' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfFeedSuggestionsController retourne 500 sur erreur', async () => {
    serviceMock.getProfFeedSuggestions.mockRejectedValue(new Error('boom'));
    const req = { user: { utilisateur_id: 'prof-1' }, query: {} };
    const res = createRes();

    await controller.getProfFeedSuggestionsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getProfFeedExperiencesController transmet les filtres', async () => {
    serviceMock.getProfFeedExperiences.mockResolvedValue({ data: [] });
    const req = {
      user: { utilisateur_id: 'prof-1' },
      query: { page: '2', limit: '10', technologie: 'Node', domaine: 'IA', meme_ecole: 'true', following: 'false', trending: 'true' },
    };
    const res = createRes();

    await controller.getProfFeedExperiencesController(req, res);

    expect(serviceMock.getProfFeedExperiences).toHaveBeenCalledWith('prof-1', {
      page: '2',
      limit: '10',
      technologie: 'Node',
      domaine: 'IA',
      meme_ecole: 'true',
      following: 'false',
      trending: 'true',
    });
  });
});
