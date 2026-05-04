const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const analyzeProjectDescription = async (description) => {
  const response = await fetch(`${API_BASE_URL}/analyze-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Could not analyze the project description');
  }

  return {
    technologies: data.technologies || [],
    domains: data.domains || []
  };
};