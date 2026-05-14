import { defineStore } from 'pinia';
import api from '@/services/api';
import { supabase } from '@/services/supabase';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);

  const isAuthenticated = computed(() => Boolean(user.value));

  async function fetchProfile() { // Appelé au démarrage pour vérifier si l'utilisateur est déjà connecté (cookie valide)
      try {
          const { data } = await api.get('/auth/profile');
          user.value = data.user;
      } catch (error) {
          user.value = null; // Cookie expiré ou absent
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

  async function login(email, password) {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    user.value = data.user;
  }

  async function register(userData) {
    const { firstName, lastName, email, password } = userData;

    const { data } = await api.post('/auth/register', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      password,
    });

    user.value = data.user;
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

    user.value = response.data.user;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
    await api.post('/auth/logout');

    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    fetchProfile,
    updateProfile,
    login,
    register,
    startGoogleAuth,
    completeGoogleAuth,
    logout,
  };
});
