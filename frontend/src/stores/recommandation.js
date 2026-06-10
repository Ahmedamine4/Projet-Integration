import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useRecommendationStore = defineStore('recommendation', () => {
  const recommendations = ref([]);
  const myRecommendations = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchPortfolioRecommendations(etudiantId) {
    if (!etudiantId) return [];

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/interactions/recommandations/portfolio/${etudiantId}`);
      recommendations.value = response.data.data || [];
      return recommendations.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch recommendations';
      recommendations.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMyRecommendations() {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/interactions/recommandations/me');
      myRecommendations.value = response.data.data || [];
      recommendations.value = myRecommendations.value;
      return recommendations.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch your recommendations';
      myRecommendations.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createRecommendation(portfolioId, texte) {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post(`/interactions/recommandations/${portfolioId}`, { texte });
      const newRecommendation = response.data.data;
      recommendations.value.unshift(newRecommendation);
      return newRecommendation;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create recommendation';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleRecommendationVisibility(interactionId, visibilite) {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.patch(
        `/interactions/recommandations/${interactionId}/visibilite`,
        { visibilite }
      );

      const updatedRecommendation = response.data.data;
      const index = recommendations.value.findIndex(r =>
        String(r.interaction_id) === String(interactionId)
      );
      if (index !== -1) {
        recommendations.value[index] = {
          ...recommendations.value[index],
          visibilite: updatedRecommendation.visibilite,
        };
      }

      const myIndex = myRecommendations.value.findIndex(r =>
        String(r.interaction_id) === String(interactionId)
      );
      if (myIndex !== -1) {
        myRecommendations.value[myIndex] = {
          ...myRecommendations.value[myIndex],
          visibilite: updatedRecommendation.visibilite,
        };
      }

      return updatedRecommendation;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update recommendation visibility';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    recommendations,
    myRecommendations,
    loading,
    error,
    fetchPortfolioRecommendations,
    fetchMyRecommendations,
    createRecommendation,
    toggleRecommendationVisibility,
  };
});
