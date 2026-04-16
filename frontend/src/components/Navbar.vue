<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
    authStore.logout();
    router.push('/');
};
</script>

<template>
    <nav>
        <div><b>PortfolioGen</b></div>
        <div v-if="!authStore.user">
            <button @click="router.push('/')">Home</button>
            <button @click="router.push('/login')">Login</button>
            <button @click="router.push('/register')">Register</button>
        </div>
        <div v-else>
            {{authStore.user.name}} ({{authStore.user.role}})
            <button @click="logout">Logout</button>
        </div>
    </nav>
</template>

<style scoped>
nav {
    padding: 12px;
    border-bottom: 1px solid black;
    display: flex;
    justify-content: space-between;
}
</style>
