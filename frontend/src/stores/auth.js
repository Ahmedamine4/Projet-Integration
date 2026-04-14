import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        users: []
    }),
    actions: {
        login(email, password) {
            const found = this.users.find(u =>
                u.email === email &&
                u.password === password
            )
            if (!found) throw new Error('Invalid credentials');
            this.user = found;
        },
        register(userData) {
            const { name, email, password, role, confirm } = userData;

            if (!name.trim()) throw new Error('Name is required');

            if (!email.includes('@')) throw new Error('Valid email required');

            if (!role) throw new Error('Role is required');

            if (password.length < 8) throw new Error('Password must be at least 8 characters');

            if (password !== confirm) throw new Error('Passwords must match');

            if (this.users.find(u => u.email === email)) throw new Error('Email already exists');

            const newUser = {name: name.trim(), email, password, role};

            this.users.push(newUser);
            this.user = newUser;
        },
        logout() {
            this.user = null;
        }
    }
})