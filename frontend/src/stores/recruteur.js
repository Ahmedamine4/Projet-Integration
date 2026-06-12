import { defineStore } from 'pinia';
import api from '@/services/api';

export const useRecruteurStore = defineStore('recruteur', {
  state: () => ({
    offres: [],
    loadingOffres: false,
  }),

  actions: {
    async fetchMesOffres(page = 1) {
      this.loadingOffres = true;

      try {
        const { data } = await api.get('/recruteur/offres', {
          params: { page },
        });

        this.offres =
          data?.data?.offres ||
          data?.data ||
          data?.offres ||
          [];

        return data;
      } finally {
        this.loadingOffres = false;
      }
    },

    async creerOffre(payload) {
      const { data } = await api.post('/recruteur/offres', payload);

      const nouvelleOffre =
        data?.data ||
        data?.offre ||
        data;

      this.offres.unshift(nouvelleOffre);

      return nouvelleOffre;
    },
  },
});