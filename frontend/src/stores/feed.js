import { defineStore } from 'pinia';
import api from '@/services/api';

export const useFeedStore = defineStore('feed', {
  state: () => ({
    experiences: [],
    offres: [],
    utilisateursSuggeres: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchFeed(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/feed', {
          params,
        });

        const payload = response.data?.data || {};

        this.experiences = payload.experiences || [];
        this.offres = payload.offres || [];
        this.utilisateursSuggeres = payload.utilisateurs_suggeres || [];

        return payload;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Erreur lors du chargement du feed';

        console.error('Erreur feed:', error.response?.data || error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});