import { defineStore } from 'pinia';
import api from '@/services/api';

const USE_MOCK = true;
const FEED_OFFERS_ENDPOINT = '/feed/offers';

const MOCK_OFFERS = [
  {
    id: 1,
    title: 'Frontend Developer Intern',
    company: 'Capgemini',
    location: 'Casablanca',
    duration: '4 to 6 months',
    level: 'Student / Junior',
    rankScore: 92,
    technologies: ['Vue 3', 'JavaScript', 'HTML', 'CSS', 'Git'],
    description:
      'Join the frontend team to build reusable Vue components and improve UI consistency.',
  },
  {
    id: 2,
    title: 'AI Engineering Intern',
    company: 'OCP Solutions',
    location: 'Hybrid',
    duration: '6 months',
    level: 'Final-year student',
    rankScore: 88,
    technologies: ['Python', 'FastAPI', 'LangChain', 'PostgreSQL'],
    description:
      'Contribute to AI-powered internal tools and LLM-based workflows.',
  },
  {
    id: 3,
    title: 'DevOps Intern',
    company: 'Orange Business',
    location: 'Casablanca',
    duration: '4 months',
    level: 'Student',
    rankScore: 81,
    technologies: ['Docker', 'CI/CD', 'Linux', 'GitLab'],
    description:
      'Assist the DevOps team with deployment pipelines and containerized environments.',
  },
];

function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getRankScore(item) {
  return Number(
    item.rankScore ??
    item.rankingScore ??
    item.matchScore ??
    item.score ??
    item.feedScore ??
    0
  );
}

function normalizeOffer(offer) {
  return {
    id: offer.id,
    title: offer.title || offer.titre || 'Offre sans titre',
    company: offer.company || offer.entreprise || offer.organisme || '',
    location: offer.location || offer.lieu || 'Non renseigné',
    duration: offer.duration || offer.duree || offer.typeContrat || '',
    level: offer.level || offer.niveau || 'Student / Junior',
    technologies: offer.technologies || offer.techStack || [],
    description: offer.description || '',
    rankScore: getRankScore(offer),
    carouselType: 'offer',
    raw: offer,
  };
}

function sortByScore(items) {
  return [...items].sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
}

export const useFeedOfferStore = defineStore('feedOffer', {
  state: () => ({
    offers: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchFeedOffers() {
      this.loading = true;
      this.error = null;

      try {
        if (USE_MOCK) {
          this.offers = sortByScore(MOCK_OFFERS.map(normalizeOffer));
          return;
        }

        const response = await api.get(FEED_OFFERS_ENDPOINT);
        const offers = extractArray(response.data, ['offers', 'stages']);

        this.offers = sortByScore(offers.map(normalizeOffer));
      } catch (error) {
        console.error('Erreur chargement offres feed:', error);

        this.error =
          error.response?.data?.message ||
          'Impossible de charger les offres.';

        this.offers = [];
      } finally {
        this.loading = false;
      }
    },

    async applyToOffer(offerId, payload) {
      if (!offerId) return;

      if (USE_MOCK) {
        console.log('Mock application offre:', { offerId, payload });
        return;
      }

      await api.post(`/stage/${offerId}/apply`, payload);
    },
  },
});