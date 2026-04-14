<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const navigate = (path) => router.push(path);

const logout = () => {
    authStore.logout();
    router.push('/');
};
</script>

<template>
    <nav>
        <div><b>PortfolioGen</b></div>
        <div v-if="!authStore.user">
            <button @click="navigate('/')">Home</button>
            <button @click="navigate('/login')">Login</button>
            <button @click="navigate('/register')">Register</button>
        </div>
        <div v-else>
            {{authStore.user.name}} ({{authStore.user.role}})
            <button @click="logout">Logout</button>
        </div>
    </nav>
</template>
