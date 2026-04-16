import { defineStore } from 'pinia';

function loadUsers() {
    const storedUsers = localStorage.getItem('stored_users');
    return storedUsers? JSON.parse(storedUsers): [];
}

function saveUsers(users) {
    localStorage.setItem('stored_users', JSON.stringify(users));
}

function saveCurrentUser(user) {
    localStorage.setItem('current_user', JSON.stringify(user));
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        users: loadUsers()
    }),
    actions: {
        login(email, password) {
            if (!email.includes('@')) throw new Error('Valid email required');
            if (!password) throw new Error('Password is required');
            const found = this.users.find(u =>
                u.email === email &&
                u.password === password
            )
            if (!found) throw new Error('Invalid credentials');
            this.user = found;
            saveCurrentUser(this.user);
        },
        register(userData) {
            const { name, email, password, role, confirm } = userData;

            if (!name.trim()) throw new Error('Name is required');

            if (!email.includes('@')) throw new Error('Valid email required');

            if (password.length < 8) throw new Error('Password must be at least 8 characters');

            if (password !== confirm) throw new Error('Passwords must match');

            if (this.users.find(u => u.email === email)) throw new Error('Email already exists');

            const newUser = {name: name.trim(), email, password, role};
            this.users.push(newUser);
            saveUsers(this.users);

            this.user = newUser;
            saveCurrentUser(this.user);
        },
        logout() {
            this.user = null;
            localStorage.removeItem('current_user');
        },
        restoreSession() {
            const currentUser = localStorage.getItem('current_user');
            if (currentUser) this.user = JSON.parse(currentUser);
        }
    }
})