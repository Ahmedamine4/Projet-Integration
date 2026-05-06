<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AppLayout from '@/layouts/AppLayout.vue';

const route = useRoute();

const isAuthRoute = computed(() => route.meta.layout === 'auth');

const isAppRoute = computed(() => route.meta.layout === 'app');
</script>

<template>
  <div id="app">
    <AuthLayout v-if="isAuthRoute">
      <router-view />
    </AuthLayout>

    <AppLayout v-else-if="isAppRoute">
      <router-view />
    </AppLayout>

    <template v-else>
      <main>
        <router-view />
      </main>
    </template>
  </div>
</template>
