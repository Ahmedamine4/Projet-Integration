import { defineStore } from 'pinia'
import api from '@/services/api'

export const useRecruteurStore = defineStore('recruteur', {
  state: () => ({
    offres: [],
    demandesParOffre: [],
    typesOffres: [],

    loadingOffres: false,
    loadingDemandes: false,
    loadingTypesOffres: false,

    errorOffres: null,
    errorDemandes: null,
    errorTypesOffres: null,
  }),

  actions: {
    async fetchMesOffres(page = 1) {
      this.loadingOffres = true
      this.errorOffres = null

      try {
        const { data } = await api.get('/recruteur/offres', {
          params: { page },
        })

        this.offres = data.data || data
        return data
      } catch (error) {
        this.errorOffres = error.response?.data?.message || 'Erreur chargement offres'
        throw error
      } finally {
        this.loadingOffres = false
      }
    },

    async creerOffre(payload) {
      this.loadingOffres = true
      this.errorOffres = null

      try {
        const { data } = await api.post('/recruteur/offres', payload)

        await this.fetchMesOffres(1)

        return data
      } catch (error) {
        this.errorOffres = error.response?.data?.message || 'Erreur création offre'
        throw error
      } finally {
        this.loadingOffres = false
      }
    },

    async terminerOffre(offreId) {
      this.loadingOffres = true
      this.errorOffres = null

      try {
        const { data } = await api.patch(`/recruteur/offres/${offreId}/terminer`)

        await this.fetchMesOffres(1)

        return data
      } catch (error) {
        this.errorOffres = error.response?.data?.message || 'Erreur terminaison offre'
        throw error
      } finally {
        this.loadingOffres = false
      }
    },

    async fetchDemandesParOffre(offreId, page = 1, limit = 10) {
      this.loadingDemandes = true
      this.errorDemandes = null

      try {
        const { data } = await api.get(`/recruteur/offres/${offreId}/demandes`, {
          params: { page, limit },
        })
      
        this.demandesParOffre = data
        return data
      } catch (error) {
        this.errorDemandes = error.response?.data?.message || 'Erreur chargement demandes'
        throw error
      } finally {
        this.loadingDemandes = false
      }
    },

    async fetchTypesOffres() {
      this.loadingTypesOffres = true
      this.errorTypesOffres = null

      try {
        const { data } = await api.get('/recruteur/types-offres')

        this.typesOffres = data.data || data
        return data
      } catch (error) {
        this.errorTypesOffres = error.response?.data?.message || 'Erreur chargement types offres'
        throw error
      } finally {
        this.loadingTypesOffres = false
      }
    },
  },
})