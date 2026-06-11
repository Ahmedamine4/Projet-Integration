import { defineStore } from 'pinia';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

export const useUserStore = defineStore('user', () => {
  async function updateProfile(updates = {}) {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('Utilisateur non connecté');
    const userId = authStore.user.utilisateur_id || authStore.user.id || authStore.user.utilisateurId;
    if (!userId) throw new Error('Impossible de déterminer l\'identifiant utilisateur');

    const payload = {};
    if (updates.firstName !== undefined) payload.prenom = updates.firstName;
    if (updates.lastName !== undefined) payload.nom = updates.lastName;
    if (updates.email !== undefined) payload.email = updates.email;

    await api.patch(`/users/update-profile/${userId}`, payload);
    await authStore.fetchProfile();
  }

  async function changePassword(currentPassword, newPassword) {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('Utilisateur non connecté');
    const userId = authStore.user.utilisateur_id || authStore.user.id || authStore.user.utilisateurId;
    if (!userId) throw new Error('Impossible de déterminer l\'identifiant utilisateur');

    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    await api.patch(`/users/update-profile/${userId}`, payload);
    await authStore.fetchProfile();
  }

  async function fetchSessions() {
    const authStore = useAuthStore();
    if (!authStore.user) return [];
    
    // On utilise la bonne route que tu avais déjà créée !
    const response = await api.get('/auth/me/sessions'); 
    return response.data.data;
  }

  async function requestProfessionnelStatus(data) {
  return await api.post('/users/request-professionnel', data);
}

async function deleteAccount(password) {
    // Axios requires the payload to be inside a 'data' object for DELETE requests
    await api.delete('/users/delete-account', {
      data: { password }
    });

    // Clear local auth state and force them back to login
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;
    localStorage.removeItem('token');
  }

  return {
    updateProfile,
    changePassword,
    fetchSessions,
    requestProfessionnelStatus,
    deleteAccount,
  };
});