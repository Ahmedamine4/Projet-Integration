<script setup>
import { storeToRefs } from "pinia";
import Sidebar from "@/components/layout/Sidebar.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
  <main class="app-shell">
    <Sidebar :user="user || undefined" />
    <section class="app-content">
      <slot />
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.app-content {
  flex: 1;
  min-width: 0;
}
</style>
