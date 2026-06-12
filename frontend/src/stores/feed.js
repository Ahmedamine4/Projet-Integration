import { defineStore } from 'pinia';
import api from '@/services/api';

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== '';
    })
  );
}

function extractListPayload(responseData) {
  if (Array.isArray(responseData?.data?.data)) {
    return {
      data: responseData.data.data,
      pagination: responseData.data.pagination || null,
      filters_appliques: responseData.data.filters_appliques || null,
    };
  }

  if (Array.isArray(responseData?.data)) {
    return {
      data: responseData.data,
      pagination: responseData.pagination || null,
      filters_appliques: responseData.filters_appliques || null,
    };
  }

  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      pagination: null,
      filters_appliques: null,
    };
  }

  return {
    data: [],
    pagination: responseData?.pagination || responseData?.data?.pagination || null,
    filters_appliques:
      responseData?.filters_appliques ||
      responseData?.data?.filters_appliques ||
      null,
  };
}

function extractTagsPayload(responseData) {
  const payload = responseData?.data || responseData || {};

  return {
    technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
    domaines: Array.isArray(payload.domaines) ? payload.domaines : [],
  };
}

function mapExperienceParams(params = {}) {
  const source = params.source || params.scope;
  const sort = params.sort;

  return cleanParams({
    page: params.page || 1,
    limit: params.limit || 10,

    technologie: params.technologie || params.technology,
    domaine: params.domaine || params.domain,

    meme_ecole:
      params.meme_ecole ??
      (source === 'school' || source === 'same-school' ? true : undefined),

    following:
      params.following ??
      (source === 'follow' || source === 'following' ? true : undefined),

    trending:
      params.trending ??
      (sort === 'trending'
        ? true
        : sort === 'newest' || sort === 'recent'
          ? false
          : undefined),
  });
}

export const useFeedStore = defineStore('feed', {
  state: () => ({
    technologies: [],
    domaines: [],

    offres: [],
    suggestions: [],
    utilisateursSuggeres: [],
    experiences: [],

    paginationOffres: null,
    paginationSuggestions: null,
    paginationExperiences: null,

    offresPagination: null,
    suggestionsPagination: null,
    experiencesPagination: null,

    filtersAppliques: null,

    filters: {
      page: 1,
      limit: 10,
      source: 'all',
      sort: 'trending',
      technology: null,
      domain: null,
    },

    loading: false,
    loadingTags: false,
    loadingOffres: false,
    loadingSuggestions: false,
    loadingExperiences: false,
    error: null,
  }),

  actions: {
    setFeedError(error, fallback = 'Erreur lors du chargement du feed') {
      this.error =
        error.response?.data?.message ||
        error.response?.data?.error ||
        fallback;
    },

    async fetchFeedTags() {
      this.loadingTags = true;

      try {
        const response = await api.get('/feed/tags');
        const payload = extractTagsPayload(response.data);

        this.technologies = payload.technologies;
        this.domaines = payload.domaines;

        return payload;
      } catch (error) {
        this.setFeedError(error, 'Erreur lors du chargement des tags du feed');
        console.error('Erreur feed tags:', error.response?.data || error);
        throw error;
      } finally {
        this.loadingTags = false;
      }
    },

    async fetchFeedOffres(params = {}) {
      this.loadingOffres = true;

      try {
        const response = await api.get('/feed/offres', {
          params: cleanParams({
            page: params.page || 1,
            limit: params.limit || 5,
          }),
        });

        const payload = extractListPayload(response.data);

        this.offres = payload.data;
        this.paginationOffres = payload.pagination;
        this.offresPagination = payload.pagination;

        return payload;
      } catch (error) {
        this.setFeedError(error, 'Erreur lors du chargement des offres du feed');
        console.error('Erreur feed offres:', error.response?.data || error);
        throw error;
      } finally {
        this.loadingOffres = false;
      }
    },

    async fetchFeedSuggestions(params = {}) {
      this.loadingSuggestions = true;

      try {
        const response = await api.get('/feed/suggestions', {
          params: cleanParams({
            page: params.page || 1,
            limit: params.limit || 5,
          }),
        });

        const payload = extractListPayload(response.data);

        this.suggestions = payload.data;
        this.utilisateursSuggeres = payload.data;

        this.paginationSuggestions = payload.pagination;
        this.suggestionsPagination = payload.pagination;

        return payload;
      } catch (error) {
        this.setFeedError(error, 'Erreur lors du chargement des suggestions du feed');
        console.error('Erreur feed suggestions:', error.response?.data || error);
        throw error;
      } finally {
        this.loadingSuggestions = false;
      }
    },

    async fetchFeedExperiences(params = {}) {
      this.loadingExperiences = true;

      try {
        const response = await api.get('/feed/experiences', {
          params: mapExperienceParams(params),
        });

        const payload = extractListPayload(response.data);

        this.experiences = payload.data;
        this.paginationExperiences = payload.pagination;
        this.experiencesPagination = payload.pagination;
        this.filtersAppliques = payload.filters_appliques;

        return payload;
      } catch (error) {
        this.setFeedError(error, 'Erreur lors du chargement des expériences du feed');
        console.error('Erreur feed expériences:', error.response?.data || error);
        throw error;
      } finally {
        this.loadingExperiences = false;
      }
    },

    async fetchInitialFeed(params = {}) {
      this.loading = true;
      this.error = null;

      this.filters = {
        ...this.filters,
        ...params,
        page: params.page || this.filters.page || 1,
      };

      try {
        await Promise.all([
          this.fetchFeedTags(),
          this.fetchFeedOffres(),
          this.fetchFeedSuggestions(),
          this.fetchFeedExperiences(this.filters),
        ]);
      } catch (error) {
        this.setFeedError(error);
        console.error('Erreur feed initial:', error.response?.data || error);
      } finally {
        this.loading = false;
      }
    },

    async updateExperienceFilters(filters = {}) {
      this.filters = {
        ...this.filters,
        ...filters,
        page: filters.page || 1,
      };

      return this.fetchFeedExperiences(this.filters);
    },

    async resetFilters() {
      this.filters = {
        page: 1,
        limit: 10,
        source: 'all',
        sort: 'trending',
        technology: null,
        domain: null,
      };

      return this.fetchFeedExperiences(this.filters);
    },

    async fetchFeed(params = {}) {
      return this.fetchInitialFeed(params);
    },
  },
});