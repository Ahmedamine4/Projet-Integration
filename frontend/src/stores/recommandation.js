import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    loading: false,
    error: null,
  }),

  actions: {
    async createRequest(payload) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(
          `${API_URL}/recommendations/request`,
          payload,
          { withCredentials: true }
        );

        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Failed to send recommendation request';

        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});