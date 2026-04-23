<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

onMounted(async () => {
    try {
        await authStore.completeGoogleAuth();
        router.replace('/dashboard');
    }
    catch (err) {
        error.value = err.message;
    }
});

</script>

<template>
    <p v-if="!error">Signing you in...</p>
    <p v-else>{{ error }}</p>
</template>