import { defineStore } from 'pinia';
import api from '@/services/api';

export const useGithubStore = defineStore('github', {
  state: () => ({
    repositories: [],
    contributions: null,
    loading: false,
    error: null,
  }),

  actions: {
    async connectGithub() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/github/login');
        window.location.href = response.data.url;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to connect GitHub';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRepositories() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/github/repositories');
        this.repositories = response.data.data || [];
        return this.repositories;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch repositories';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async syncRepositories() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/github/sync', {});
        this.repositories = response.data.data?.repositories || response.data.data || [];
        return this.repositories;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to sync repositories';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchContributions(userId = null) {
      this.loading = true;
      this.error = null;

      try {
        const endpoint = userId
          ? `/github/contributions/${userId}`
          : '/github/contributions';
        const response = await api.get(endpoint);
        this.contributions = response.data.data || null;
        return this.contributions;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch contributions';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
