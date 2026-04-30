<script setup>
import Sidebar from '@/components/Sidebar.vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
    <main class="dashboard-shell">
        <Sidebar :user="user || undefined" />
        <section class="dashboard-content">

        </section>
    </main>
</template>

<style scoped>
.dashboard-shell {
    display: flex;
    min-height: 100vh;
    background: var(--color-background);
}

.dashboard-content {
    flex: 1;
    min-width: 0;
    padding: var(--space-xl);
}
</style>
