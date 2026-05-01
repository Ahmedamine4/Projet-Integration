<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Error from '@/components/common/Error.vue';

const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

onMounted(async () => {
    try {
        await authStore.completeGoogleAuth();
        router.replace('/getting-started');
    }
    catch (err) {
        if (!err.response)
            error.value = "Network error. Please try again.";
        else {
            error.value =
                err.response.data?.message ||
                "Something went wrong";
        }
    }
});

</script>

<template>
    <div
        class="loading"
        v-if="!error"
    >
        <span
            class="loading__spinner"
        />
        <span>Signing you in...</span>
    </div>
    <Error v-else>{{ error }}</Error>
</template>
<style scoped>
.loading {
    display: flex;
    justify-content: center;
    align-items: center;
}
.loading__spinner {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
    border: 3px solid currentColor;
    border-top-color: transparent;
    border-radius: 999px;
    animation: loading-spin 0.7s linear infinite;
} 

@keyframes loading-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>