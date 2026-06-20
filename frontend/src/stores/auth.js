import { defineStore } from 'pinia';
import api from '@/services/api';
import { supabase } from '@/services/supabase';
import { ref, computed } from 'vue';

function normalizeAuthUser(user) {
  if (!user) return null;

  return {
    ...user,
    firstName: user.prenom ?? '',
    lastName: user.nom ?? '',
    phone: user.telephone ?? '',
    photo: user.photo ?? '',
  };
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const profileLoading = ref(false);
  const profileChecked = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value));

  async function fetchProfile() { // Appelé au démarrage pour vérifier si l'utilisateur est déjà connecté (cookie valide)
      profileLoading.value = true;

      try {
          const { data } = await api.get('/auth/profile');
          user.value = normalizeAuthUser(data.user);
      } catch {
          user.value = null; // Cookie expiré ou absent
      } finally {
          profileLoading.value = false;
          profileChecked.value = true;
      }
  }

  async function updateProfile(payload) {
    if (!user.value?.utilisateur_id) {
      throw new Error('User not loaded');
    }

    const { data } = await api.patch(
      `/users/update-profile/${user.value.utilisateur_id}`,
      payload
    );

    await fetchProfile();

    return data;
  }

  async function uploadProfilePhoto(file) {
    if (!user.value?.utilisateur_id) {
      throw new Error('User not loaded');
    }

    const formData = new FormData();
    formData.append('photo', file);

    const { data } = await api.post(
      `/users/${user.value.utilisateur_id}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    user.value = normalizeAuthUser({
      ...user.value,
      photo: data.photo ?? '',
    });

    return data.photo ?? '';
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    user.value = normalizeAuthUser(data.user);
  }

  async function register(userData) {
    const { firstName, lastName, email, password } = userData;

    const { data } = await api.post('/auth/register', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      password,
    });

    user.value = normalizeAuthUser(data.user);
  }

  async function startGoogleAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) throw error;
  }

  async function completeGoogleAuth() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!data || !data.session) {
      throw new Error('No Google/Supabase session found');
    }

    const supabaseToken = data.session.access_token;

    const response = await api.post('/auth/google', {
      access_token: supabaseToken,
    });

    user.value = normalizeAuthUser(response.data.user);
  }

async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (backendError) {
      console.error('Failed to logout:', backendError);
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Supabase logout warning:', error);
    }

    user.value = null;
  
  }

  return {
    user,
    profileLoading,
    profileChecked,
    isAuthenticated,
    fetchProfile,
    updateProfile,
    uploadProfilePhoto,
    login,
    register,
    startGoogleAuth,
    completeGoogleAuth,
    logout,
  };
});
