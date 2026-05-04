import api from '@/services/api';

export const analyzeProjectDescription = async (description) => {
  const { data } = await api.post('/ai/predict', {
    text: description
  });

  console.log('AI raw response:', data);

  return {
    technologies: data.message?.technologies || [],
    domains: data.message?.domains || []
  };
};