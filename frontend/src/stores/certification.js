import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { normalizeCertification } from '@/utils/portfolioNormalizers';

function buildCertificationFormData(certification) {
  const formData = new FormData();

  formData.append('titre', certification.title);
  formData.append('date', certification.date);
  formData.append('credentialUrl', certification.certificateURL);
  formData.append('description', certification.description);
  formData.append('code', certification.certificateCode);
  formData.append('visibleToEveryone', String(certification.visibleToEveryone));
  formData.append(
    'competences',
    JSON.stringify([
      ...(certification.technologies ?? []).map((nom) => ({
        nom,
        type: 'technologie',
      })),
      ...(certification.domains ?? []).map((nom) => ({
        nom,
        type: 'domaine',
      })),
    ])
  );

  if (certification.image) {
    formData.append('photo', certification.image);
  }

  return formData;
}

export const useCertificationStore = defineStore('certification', () => {
  const certifications = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function createCertification(certification) {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.post(
        '/certifications',
        buildCertificationFormData(certification),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const createdCertification = normalizeCertification(response.data.data);
      certifications.value.unshift(createdCertification);

      return createdCertification;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create certification';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    certifications,
    loading,
    error,
    createCertification,
  };
});
