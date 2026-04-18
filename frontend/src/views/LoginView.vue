<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';

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
    <BaseCard title="Login">
        <BaseInput v-model="email" label="Email" placeholder="email" />
        <BaseInput v-model="password" label="Password" type="password" placeholder="password" />
        <BaseButton @click="login">Login</BaseButton>
        <p class="error">{{error}}</p>
    </BaseCard>
</template>
