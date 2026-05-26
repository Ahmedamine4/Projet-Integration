import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { formatLocalDate } from '@/utils/date';

function buildActivityFormData(activity) {
  const formData = new FormData();

  formData.append('titre', activity.title);
  formData.append('date_experience', activity.date);
  formData.append('description', activity.description);
  formData.append('type', activity.activityType);
  formData.append('lieu', activity.location);
  formData.append('typeActivite', 'personnelle');
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
    formData.append('photo', activity.image);
  }

  return formData;
}

function normalizeActivity(data) {
  return {
    id: data.experience_id,
    type: 'activity',
    title: data.experience?.titre ?? '',
    date: formatLocalDate(data.experience?.date_experience),
    description: data.experience?.description ?? '',
    visibleToEveryone: data.experience?.visibilite ?? false,
    activityType: data.type ?? '',
    location: data.lieu ?? '',
    club: '',
    technologies:
      data.experience?.competences
        ?.filter((competence) => competence.type === 'technologie')
        .map((technology) => technology.nom) ?? [],
    domains:
      data.experience?.competences
        ?.filter((competence) => competence.type === 'domaine')
        .map((domain) => domain.nom) ?? [],
    imagePreview: data.experience?.documentations?.[0]?.captures ?? '',
  };
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

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity,
  };
});
