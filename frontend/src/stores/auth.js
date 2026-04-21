import { defineStore } from 'pinia';
import api from '@/services/api';

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
            const {firstName, lastName, email, password , role} = userData;
            const { data } = await api.post('/auth/register', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email,
                password,
                role
            });

            this.user = data.user;
            this.token = data.token;

            persistSession(data.user, data.token);
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
