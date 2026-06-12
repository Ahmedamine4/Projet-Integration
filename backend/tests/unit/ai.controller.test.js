import { beforeEach, describe, expect, it, vi } from 'vitest';

const predictPortfolioTextMock = vi.fn();

vi.mock('../../src/services/ai.service.js', () => ({
  predictPortfolioText: predictPortfolioTextMock,
}));

const { predictTechnologiesAndDomains } = await import(
  '../../src/controllers/ai.controller.js'
);

function createResponseMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('ai.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 400 si text est absent', async () => {
    const req = {
      body: {},
    };
    const res = createResponseMock();

    await predictTechnologiesAndDomains(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Text is required',
    });
    expect(predictPortfolioTextMock).not.toHaveBeenCalled();
  });

  it('retourne 400 si text est vide apres trim', async () => {
    const req = {
      body: {
        text: '   ',
      },
    };
    const res = createResponseMock();

    await predictTechnologiesAndDomains(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Text is required',
    });
  });

  it('retourne 200 avec la prediction du service', async () => {
    predictPortfolioTextMock.mockResolvedValue({
      technologies: ['Node.js'],
      domaines: ['Web'],
    });

    const req = {
      body: {
        text: 'Projet backend Node.js',
      },
    };
    const res = createResponseMock();

    await predictTechnologiesAndDomains(req, res);

    expect(predictPortfolioTextMock).toHaveBeenCalledWith(
      'Projet backend Node.js'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: {
        technologies: ['Node.js'],
        domaines: ['Web'],
      },
    });
  });

  it('retourne 500 si le service IA echoue', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    predictPortfolioTextMock.mockRejectedValue(new Error('AI service failed'));

    const req = {
      body: {
        text: 'Projet backend Node.js',
      },
    };
    const res = createResponseMock();

    await predictTechnologiesAndDomains(req, res);

    expect(errorSpy).toHaveBeenCalledWith(
      'AI prediction error:',
      'AI service failed'
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'AI prediction failed',
    });
  });
});
