import api from '@/services/api';

export const analyzeProjectDescription = async (description) => {
  const { data } = await api.post('/ai/predict', {
    text: description
  });

  return {
    technologies: data.message?.technologies || [],
    domains: data.message?.domains || []
  };
};