import { defineStore } from 'pinia';
import api from '@/services/api';
import { supabase } from '@/services/supabase';
import { ref, computed } from 'vue';

function normalizeUser(user) {
  if (!user) return null;

  const { prenom, nom, ...rest } = user;

  return {
    ...rest,
    firstName: user.firstName || prenom || '',
    lastName: user.lastName || nom || '',
  };
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);

  const isAuthenticated = computed(() => Boolean(user.value && token.value));

  async function login(email, password) {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    user.value = normalizeUser(data.user);
    token.value = data.token;
  }

  async function register(userData) {
    const { firstName, lastName, email, password } = userData;
    const { data } = await api.post('/auth/register', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      password,
    });

    user.value = normalizeUser(data.user);
    token.value = data.token;
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
      throw new Error('Aucune session Google/Supabase trouvée');
    }

    const supabaseToken = data.session.access_token;

    const response = await api.post('/auth/google', {
      access_token: supabaseToken,
    });

    user.value = normalizeUser(response.data.user);
    token.value = response.data.token;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    user.value = null;
    token.value = null;
  }
  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    startGoogleAuth,
    completeGoogleAuth,
    logout,
  };
});
