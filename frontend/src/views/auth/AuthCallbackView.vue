<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseError from '@/components/common/BaseError.vue';
import BaseSpinner from '@/components/common/BaseSpinner.vue';

const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

onMounted(async () => {
  try {
    await authStore.completeGoogleAuth();
    const redirectPath = sessionStorage.getItem('auth_redirect') || '/getting-started';
    sessionStorage.removeItem('auth_redirect');

    router.replace(redirectPath);
  } catch (err) {
    if (!err.response) error.value = 'Network error. Please try again.';
    else {
      error.value = err.response.data?.message || 'Something went wrong';
    }
  }
});
</script>

<template>
  <div class="loading" v-if="!error">
    <BaseSpinner size="lg" />
    <span>Signing you in...</span>
  </div>
  <BaseError v-else>{{ error }}</BaseError>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 1rem;
}
</style>
