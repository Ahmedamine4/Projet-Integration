import axios from "axios";
import router from "../router";

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
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // éviter une boucle infinie

            try {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {}, {
                    withCredentials: true
                });
                
                //relance la requête originale échouée
                return api(originalRequest);
            } catch (refreshError) {
                router.push('/login');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);


export default api;