import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const useGithubStore = defineStore('github', {
  state: () => ({
    repositories: [],
    loading: false,
    error: null,
  }),

  actions: {
    async connectGithub() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`${API_URL}/github/login`, {
          withCredentials: true,
        });

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
        const response = await axios.get(`${API_URL}/github/repositories`, {
          withCredentials: true,
        });

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
        const response = await axios.post(`${API_URL}/github/sync`, {}, {
          withCredentials: true,
        });

        this.repositories = response.data.data || [];
        return this.repositories;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to sync repositories';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});