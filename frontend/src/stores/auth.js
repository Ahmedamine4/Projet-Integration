import { defineStore } from 'pinia';
import api from '@/services/api';
import { supabase } from '@/services/supabase';

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

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: getStoredUser(),
        token: getStoredToken()
    }),
    getters: {
        isAuthenticated: (state) => Boolean(state.user && state.token)
    },
    actions: {
        async login(email, password) {
            const { data } = await api.post('/auth/login', {
                email,
                password
            });

            this.user = data.user;
            this.token = data.token;

            persistSession(data.user, data.token);
        },

        async register(userData) {
            const {firstName, lastName, email, password} = userData;
            const { data } = await api.post('/auth/register', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email,
                password
            });

            this.user = data.user;
            this.token = data.token;

            persistSession(data.user, data.token);
        },

        async startGoogleAuth() {
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
        },

        async completeGoogleAuth() {
            const code = new URLSearchParams(window.location.search).get('code');

            if (code) {
                const {error} = await supabase.auth.exchangeCodeForSession(code);
                if (error) throw error;
            }

            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;

            const supabaseToken = data.session?.access_token;
            if (!supabaseToken) throw new Error('Missing Supabase session');

            const reponse = await api.post(
                '/auth/google',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${supabaseToken}`
                    }
                }
            );
            
            this.user = reponse.data.user;
            this.token = reponse.data.token;

            persistSession(reponse.data.user, reponse.data.token);
        },

        logout() {
            this.user = null;
            this.token = null;
            clearSession();
        },

        restoreSession() {
           this.user = getStoredUser();
           this.token = getStoredToken();
        }
    }
});


/*
{
  "user": {
    "id": 1,
    "firstName": "Moussa"
    "lastName": "El Moussaoui",
    "email": "moussa@example.com",
    "role": "student"
  },
  "token": "abc123"
}
*/
