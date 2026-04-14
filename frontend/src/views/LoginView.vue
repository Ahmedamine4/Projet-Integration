<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
    try {
        await authStore.login(email.value, password.value);
        router.push('/dashboard');
    }
    catch(err) {
        error.value = err.message;
    }
}
</script>

<template>
    <div class="card">
        <h2>Login</h2>
        <input v-model="email" placeholder="email" />
        <input type="password" v-model="password" placeholder="password" />
        <button @click="login">Login</button>
        <p class="error">{{error}}</p>
    </div>
</template>