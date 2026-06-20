<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import BaseNotification from '@/components/common/feedback/BaseNotification.vue';

const route = useRoute();

const isAuthRoute = computed(() => route.meta.layout === 'auth');

const isAppRoute = computed(() => route.meta.layout === 'app');

const globalNotification = ref({ message: '', type: 'error' });

function showGlobalNotification(e) {
  globalNotification.value = {
    message: e.detail.message,
    type: e.detail.type || 'error'
  };
  setTimeout(() => {
    globalNotification.value.message = '';
  }, 4500);
}

onMounted(() => {
  window.addEventListener('global-notification', showGlobalNotification);
});

onUnmounted(() => {
  window.removeEventListener('global-notification', showGlobalNotification);
});
</script>

<template>
  <div id="app">
    <Teleport to="body">
      <BaseNotification
        :message="globalNotification.message"
        :type="globalNotification.type"
        @close="globalNotification.message = ''"
      />
    </Teleport>
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
