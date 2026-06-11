import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // pour envoyer les cookies avec les requêtes
  headers: {
      'Content-Type': 'application/json'
  }
});

// Intercepteur pour gérer l'expiration du token
// 🛡️ Capture les erreurs 401 (token expiré) pour rafraîchir silencieusement la session en arrière-plan.
// Si le rafraîchissement réussit, rejoue la requête initiale de manière transparente, sinon redirige vers le login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network Errors / Timeout (No response from server)
    if (!error.response) {
      window.dispatchEvent(new CustomEvent('global-notification', {
        detail: { message: "Problème de connexion internet, veuillez vérifier votre réseau", type: 'error' }
      }));
      return Promise.reject(error);
    }

    // 401 Expired Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true
          }
        );

        return api(originalRequest);
      } catch (refreshError) {
        // Déconnecter proprement et le rediriger vers la page de Login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 500 Internal Server Error
    if (error.response?.status >= 500) {
      window.dispatchEvent(new CustomEvent('global-notification', {
        detail: { message: "Erreur interne du serveur, nos équipes sont sur le coup", type: 'error' }
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
