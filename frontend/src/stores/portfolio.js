import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { normalizePortfolio } from '@/utils/portfolioNormalizers';

export const usePortfolioStore = defineStore('portfolio', () => {
  const portfolio = ref(null);
  const loading = ref(false);
  const error = ref('');

  async function fetchPortfolio(userId) {
    if (!userId) return null;

    loading.value = true;
    error.value = '';

    try {
      const response = await api.get(`/users/portfolio/${userId}`);
      portfolio.value = normalizePortfolio(response.data.data);
      return portfolio.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch portfolio';
      portfolio.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function prependProject(project) {
    if (!portfolio.value) return;
    portfolio.value.projects = [project, ...portfolio.value.projects];
  }

  function prependActivity(activity) {
    if (!portfolio.value) return;
    portfolio.value.activities = [activity, ...portfolio.value.activities];
  }

  function prependCertification(certification) {
    if (!portfolio.value) return;
    portfolio.value.certifications = [certification, ...portfolio.value.certifications];
  }

  return {
    portfolio,
    loading,
    error,
    fetchPortfolio,
    prependProject,
    prependActivity,
    prependCertification,
  };
});
