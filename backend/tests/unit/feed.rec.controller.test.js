import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  getProfessionnelFeedStudentsTop: vi.fn(),
  getProfessionnelFeedSuggestions: vi.fn(),
  getProfessionnelFeedExperiences: vi.fn(),
  getProfessionnelFeedTags: vi.fn(),
};

vi.mock('../../src/services/feed.rec.service.js', () => serviceMock);

const controller = await import('../../src/controllers/feed.rec.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('feed.rec.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProfessionnelFeedTagsController retourne les tags', async () => {
    serviceMock.getProfessionnelFeedTags.mockResolvedValue({ technologies: [] });
    const res = createRes();

    await controller.getProfessionnelFeedTagsController({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfessionnelFeedStudentsTopController transmet professionnelId et pagination', async () => {
    serviceMock.getProfessionnelFeedStudentsTop.mockResolvedValue({ data: [] });
    const req = { user: { utilisateur_id: 'pro-1' }, query: { page: '1', limit: '5' } };
    const res = createRes();

    await controller.getProfessionnelFeedStudentsTopController(req, res);

    expect(serviceMock.getProfessionnelFeedStudentsTop).toHaveBeenCalledWith('pro-1', { page: '1', limit: '5' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfessionnelFeedSuggestionsController retourne 500 sur erreur', async () => {
    serviceMock.getProfessionnelFeedSuggestions.mockRejectedValue(new Error('boom'));
    const req = { user: { utilisateur_id: 'pro-1' }, query: {} };
    const res = createRes();

    await controller.getProfessionnelFeedSuggestionsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getProfessionnelFeedExperiencesController transmet les filtres', async () => {
    serviceMock.getProfessionnelFeedExperiences.mockResolvedValue({ data: [] });
    const req = {
      user: { utilisateur_id: 'pro-1' },
      query: { page: '2', limit: '8', technologie: 'React', domaine: 'Web', following: 'true', trending: 'false' },
    };
    const res = createRes();

    await controller.getProfessionnelFeedExperiencesController(req, res);

    expect(serviceMock.getProfessionnelFeedExperiences).toHaveBeenCalledWith('pro-1', {
      page: '2',
      limit: '8',
      technologie: 'React',
      domaine: 'Web',
      following: 'true',
      trending: 'false',
    });
  });
});
