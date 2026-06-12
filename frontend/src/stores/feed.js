import { defineStore } from 'pinia';
import api from '@/services/api';

const EXPERIENCE_PAGE_SIZE = 4;

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
    limit: params.limit || EXPERIENCE_PAGE_SIZE,

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
      limit: EXPERIENCE_PAGE_SIZE,
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
    isLoadingMore: false,
    hasMoreExperiences: true,
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
      const append = Boolean(params.append);

      if (append) {
        if (this.isLoadingMore || !this.hasMoreExperiences) {
          return {
            data: [],
            pagination: this.paginationExperiences,
            filters_appliques: this.filtersAppliques,
          };
        }

        this.isLoadingMore = true;
      } else {
        this.loadingExperiences = true;
        this.hasMoreExperiences = true;
      }

      const requestParams = {
        ...this.filters,
        ...params,
        page: params.page || (append ? this.filters.page + 1 : 1),
        limit: EXPERIENCE_PAGE_SIZE,
      };

      delete requestParams.append;

      try {
        const response = await api.get('/feed/experiences', {
          params: mapExperienceParams(requestParams),
        });

        const payload = extractListPayload(response.data);
        const pagination = payload.pagination;
        const currentPage = Number(pagination?.page || requestParams.page || 1);
        const totalPages = Number(pagination?.totalPages || pagination?.total_pages || 0);

        this.experiences = append
          ? [...this.experiences, ...payload.data]
          : payload.data;
        this.paginationExperiences = pagination;
        this.experiencesPagination = pagination;
        this.filtersAppliques = payload.filters_appliques;
        this.filters = {
          ...this.filters,
          ...requestParams,
          page: currentPage,
          limit: EXPERIENCE_PAGE_SIZE,
        };
        this.hasMoreExperiences = totalPages
          ? currentPage < totalPages
          : payload.data.length >= EXPERIENCE_PAGE_SIZE;

        return payload;
      } catch (error) {
        this.setFeedError(error, 'Erreur lors du chargement des expériences du feed');
        console.error('Erreur feed expériences:', error.response?.data || error);
        throw error;
      } finally {
        if (append) {
          this.isLoadingMore = false;
        } else {
          this.loadingExperiences = false;
        }
      }
    },

    async fetchInitialFeed(params = {}) {
      this.loading = true;
      this.error = null;

      this.filters = {
        ...this.filters,
        ...params,
        page: params.page || this.filters.page || 1,
        limit: EXPERIENCE_PAGE_SIZE,
      };
      this.hasMoreExperiences = true;

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
        limit: EXPERIENCE_PAGE_SIZE,
      };
      this.hasMoreExperiences = true;

      return this.fetchFeedExperiences(this.filters);
    },

    async resetFilters() {
      this.filters = {
        page: 1,
        limit: EXPERIENCE_PAGE_SIZE,
        source: 'all',
        sort: 'trending',
        technology: null,
        domain: null,
      };
      this.hasMoreExperiences = true;

      return this.fetchFeedExperiences(this.filters);
    },

    async fetchFeed(params = {}) {
      return this.fetchInitialFeed(params);
    },
  },
});
