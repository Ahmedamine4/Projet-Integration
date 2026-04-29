<script setup>
import Sidebar from '@/components/Sidebar.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const user = ref(authStore.user);
</script>

<template>
</template>

<style scoped>
</style>
