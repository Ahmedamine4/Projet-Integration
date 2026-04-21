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
            if (!email.includes('@')) throw new Error('Valid email required');

            if (!password) throw new Error('Password is required');

            const { data } = await api.post('/auth/login', {
                email,
                password
            });

            this.user = data.user;
            this.token = data.token;

            persistSession(data.user, data.token);
        },

        async register(userData) {
            const { firstName, lastName, email, password, role, confirm } = userData;

            if (!firstName.trim()) throw new Error('First name is required');

            if (!lastName.trim()) throw new Error('Last name is required');

            if (!email.includes('@')) throw new Error('Valid email required');

            if (password.length < 8) throw new Error('Password must be at least 8 characters');

            if (password !== confirm) throw new Error('Passwords must match');

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
