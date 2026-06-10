import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { normalizeActivity } from '@/utils/portfolioNormalizers';

function buildActivityFormData(activity) {
  const formData = new FormData();

  formData.append('titre', activity.title);
  formData.append('date_experience', activity.date);
  formData.append('description', activity.description);
  formData.append('type', activity.activityType);
  formData.append('lieu', activity.location);
  formData.append('typeActivite', activity.isAcademic ? 'academique' : 'personnelle');
  formData.append('is_academique', String(Boolean(activity.isAcademic)));
  formData.append('nom_institution', activity.institution ?? '');
  formData.append('visibilite', String(activity.visibleToEveryone));
  formData.append(
    'competences',
    JSON.stringify([
      ...(activity.technologies ?? []).map((nom) => ({
        nom,
        type: 'technologie',
      })),
      ...(activity.domains ?? []).map((nom) => ({
        nom,
        type: 'domaine',
      })),
    ])
  );

  formData.append('documentations', JSON.stringify([]));

  if (activity.image) {
    formData.append('img', activity.image);
  }

  return formData;
}

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchActivities() {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.get('/activites/me');
      activities.value = (response.data.data ?? []).map(normalizeActivity);
      return activities.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch activities';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createActivity(activity) {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.post(
        '/activites',
        buildActivityFormData(activity),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const createdActivity = normalizeActivity(response.data.data);
      activities.value.unshift(createdActivity);

      return createdActivity;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create activity';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function editActivity(activity) {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.patch(
        `/activites/${activity.id}`,
        buildActivityFormData(activity),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedActivity = normalizeActivity(response.data.data);
      activities.value = activities.value.map((item) =>
        item.id === updatedActivity.id ? updatedActivity : item
      );

      return updatedActivity;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to edit activity';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteActivity(activityId) {
    loading.value = true;
    error.value = '';

    try {
      await api.delete(`/activites/${activityId}`);
      activities.value = activities.value.filter((item) => item.id !== activityId);
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete activity';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity,
    editActivity,
    deleteActivity,
  };
});
