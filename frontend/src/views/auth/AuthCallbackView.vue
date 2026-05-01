<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Error from '@/components/common/Error.vue';
import Spinner from '@/components/common/Spinner.vue';

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
        <Spinner
            size="lg"
            class="spinner"
        />
        <span>Signing you in...</span>
    </div>
    <Error v-else>{{ error }}</Error>
</template>

<style scoped>
.spinner {
    margin-right: 1rem;
}
</style>