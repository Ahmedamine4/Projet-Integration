import { defineStore } from "pinia";
import api from '@/services/api';
import { supabase } from "@/services/supabase";
import { ref, computed } from 'vue';

function getStoredUser() {
    const storedUser = localStorage.getItem('current_user');
    return storedUser ? JSON.parse(storedUser) : null;
}

function getStoredToken() {
    return localStorage.getItem('token');
}

function persistSession(user, token) {
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('token', token);
}

function clearSession() {
    localStorage.removeItem('current_user');
    localStorage.removeItem('token');
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref(getStoredUser());
    const token = ref(getStoredToken());

    const isAuthenticated = computed(() => Boolean(user.value && token.value));

    async function login(email, password) {
        const { data } = await api.post('/auth/login', {
            email,
            password
        });

        user.value = data.user;
        token.value = data.token;

        persistSession(data.user, data.token);
    }

    async function register(userData) {
        const {firstName, lastName, email, password} = userData;
        const { data } = await api.post('/auth/register', {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            password
        });

        user.value = data.user;
        token.value = data.token;

        persistSession(data.user, data.token);
    }

    async function startGoogleAuth() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    prompt: 'select_account'
                }
            }
        });
        if (error) throw error;
    }

    async function completeGoogleAuth() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const supabaseToken = data.session?.access_token;
        if (!supabaseToken) throw new Error('Missing Supabase session');

        const response = await api.post(
            '/auth/google',
            {},
            {
                headers: {
                    Authorization: `Bearer ${supabaseToken}`
                }
            }
        );
        
        user.value = response.data.user;
        token.value = response.data.token;

        persistSession(response.data.user, response.data.token);
    }

    async function logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        user.value = null;
        token.value = null;

        clearSession();
    }

    function restoreSession() {
        user.value = getStoredUser();
        token.value = getStoredToken();
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
        restoreSession
    };
});


/*
{
  "user": {
    "id": 1,
    "firstName": "Moussa",
    "lastName": "El Moussaoui",
    "email": "moussa@example.com",
    "role": "student"
  },
  "token": "abc123"
}
*/
