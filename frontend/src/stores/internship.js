import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import {
  normalizeCreatedInternship,
  normalizeInternship,
} from '@/utils/portfolioNormalizers';

function buildInternshipFormData(internship) {
  const formData = new FormData();

  formData.append('titre', internship.title);
  formData.append('date_debut', internship.startDate);
  formData.append('date_fin', internship.endDate);
  formData.append('description', internship.description);
  formData.append('is_academique', internship.isAcademic);
  formData.append('email_professeur', internship.teacherEmail);
  formData.append('technologies', JSON.stringify(internship.technologies));
  formData.append('domaines', JSON.stringify(internship.domains));
  formData.append('rapport_stage', internship.report);
  formData.append('missions_realisees', internship.missions);

  if (internship.image) {
    formData.append('photo', internship.image);
  }

  return formData;
}

export const useInternshipStore = defineStore('internship', () => {
  const internships = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchInternships() {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.get('/stages/stages');
      internships.value = (response.data.data ?? []).map(normalizeInternship);
      return internships.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch internships';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createInternship(internship) {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.post('/stages/add-stage',
        buildInternshipFormData(internship), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdInternship = normalizeCreatedInternship(response.data.data);
      internships.value.unshift(createdInternship);

      return createdInternship;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create internship';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function editInternship(internship) {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.patch(
        `/stages/stages/${internship.id}`,
        buildInternshipFormData(internship),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedInternship = normalizeInternship(response.data.data);

      internships.value = internships.value.map((item) =>
        item.id === updatedInternship.id ? updatedInternship : item
      );

      return updatedInternship;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to edit internship';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    internships,
    loading,
    error,
    fetchInternships,
    createInternship,
    editInternship,
  };
});
