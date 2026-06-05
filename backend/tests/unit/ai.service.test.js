import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = {
  post: vi.fn(),
};

vi.mock('axios', () => ({
  default: axiosMock,
}));

process.env.AI_API_URL = 'http://ai-service.test';

const { predictPortfolioText } = await import('../../src/services/ai.service.js');

describe('ai.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('predictPortfolioText envoie le texte a l API IA et retourne response.data', async () => {
    axiosMock.post.mockResolvedValue({
      data: {
        prediction: 'portfolio',
        score: 0.92,
      },
    });

    const result = await predictPortfolioText('Mon texte de portfolio');

    expect(axiosMock.post).toHaveBeenCalledWith(
      'http://ai-service.test/predict',
      {
        text: 'Mon texte de portfolio',
      }
    );
    expect(result).toEqual({
      prediction: 'portfolio',
      score: 0.92,
    });
  });

  it('predictPortfolioText log l erreur de reponse du serveur puis lance une erreur generique', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axiosMock.post.mockRejectedValue({
      response: {
        data: {
          detail: 'Modele indisponible',
        },
      },
    });

    await expect(
      predictPortfolioText('Texte en erreur')
    ).rejects.toThrow('AI service failed');

    expect(errorSpy).toHaveBeenCalledWith('AI error response;', {
      detail: 'Modele indisponible',
    });
  });

  it('predictPortfolioText log error.message si aucune response Axios n existe', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axiosMock.post.mockRejectedValue(new Error('connect ECONNREFUSED'));

    await expect(
      predictPortfolioText('Texte en erreur reseau')
    ).rejects.toThrow('AI service failed');

    expect(errorSpy).toHaveBeenCalledWith(
      'AI error:',
      'connect ECONNREFUSED'
    );
  });
});
