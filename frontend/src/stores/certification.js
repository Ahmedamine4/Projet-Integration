import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { normalizeCertification } from '@/utils/portfolioNormalizers';

function buildCertificationPayload(certification) {
  return {
    title: certification.title,
    issueDate: certification.date,
    credentialUrl: certification.certificateURL,
    description: certification.description,
    code: certification.certificateCode,
    visibleToEveryone: certification.visibleToEveryone,
  };
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
        buildCertificationPayload(certification)
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
