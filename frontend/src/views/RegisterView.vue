<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const name = ref('');
const email = ref('');
const role = ref('');
const password = ref('');
const confirm = ref('');
const error = ref('');

const register = async () => {
    try {
        await authStore.register({
            name: name.value,
            email: email.value,
            role: role.value,
            password: password.value,
            confirm: confirm.value
        });
        router.push('/dashboard');
    }
    catch(err) {
        error.value = err.message;
    }
}
</script>

<template>
    <div class="card">
        <h2>Register</h2>
        <input v-model="name" placeholder="name" />
        <input v-model="email" placeholder="email" />
        <select v-model="role">
            <option disabled value="">select role</option>
            <option>student</option>
            <option>teacher</option>
            <option>professional</option>
        </select>
        <input type="password" v-model="password" placeholder="password" />
        <input type="password" v-model="confirm" placeholder="confirm password" />
        <button @click="register">Register</button>
        <p class="error">{{error}}</p>
    </div>
</template>