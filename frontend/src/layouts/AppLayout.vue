<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import NotificationsPanel from '@/components/NotificationsPanel.vue';
import { useAuthStore } from '@/stores/auth';
import { getNotifications } from '@/services/notificationService';
import { useRoute } from 'vue-router';
import { X } from 'lucide-vue-next';

const authStore = useAuthStore();
const route = useRoute();
const { user, profileLoading, profileChecked } = storeToRefs(authStore);
const isNotificationsOpen = ref(false);
const isSidebarCollapsed = ref(true);
const unreadNotificationsCount = ref(0);
const hasUnreadNotifications = computed(() => unreadNotificationsCount.value > 0);

function toggleNotifications() {
  isNotificationsOpen.value = !isNotificationsOpen.value;
}

function closeNotifications() {
  isNotificationsOpen.value = false;
}

function updateUnreadNotificationsCount(notifications) {
  unreadNotificationsCount.value = notifications.filter(
    (notification) => !notification.read,
  ).length;
}

async function loadUnreadNotificationsCount() {
  try {
    updateUnreadNotificationsCount(await getNotifications());
  } catch {
    unreadNotificationsCount.value = 0;
  }
}

watch(
  () => route.fullPath,
  () => {
    closeNotifications();
  },
);

onMounted(loadUnreadNotificationsCount);
</script>

<template>
  <main class="app-shell">
    <AppSidebar
      :user="user || undefined"
      :loading="profileLoading || !profileChecked"
      :notifications-open="isNotificationsOpen"
      :has-unread-notifications="hasUnreadNotifications"
      @open-notifications="toggleNotifications"
      @update:collapsed="isSidebarCollapsed = $event"
    />
    <section class="app-content">
      <slot />
    </section>

    <div
      v-if="isNotificationsOpen"
      class="notifications-modal"
      :class="{ 'notifications-modal--sidebar-expanded': !isSidebarCollapsed }"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      @click.self="closeNotifications"
    >
      <div class="notifications-modal__content">
        <button
          type="button"
          class="notifications-modal__close"
          title="Fermer"
          aria-label="Fermer les notifications"
          @click="closeNotifications"
        >
          <X :size="20" />
        </button>

        <NotificationsPanel @notifications-updated="updateUnreadNotificationsCount" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.app-content {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 100vh;
}

.notifications-modal {
  --notifications-sidebar-offset: 54px;
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding:
    var(--space-sm)
    24px
    var(--space-sm)
    calc(var(--notifications-sidebar-offset) + 24px);
  background: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: padding-left var(--transition-normal);
}

.notifications-modal--sidebar-expanded {
  --notifications-sidebar-offset: 208px;
}

.notifications-modal__content {
  position: relative;
  width: min(500px, calc(100% - 48px));
  animation: notifications-slide-in 0.24s ease-out;
}

.notifications-modal__close {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.82);
  color: var(--color-primary);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.notifications-modal__close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(var(--color-secondary-rgb), 0.16);
}

@keyframes notifications-slide-in {
  from {
    opacity: 0;
    transform: translateX(-18px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .notifications-modal {
    align-items: flex-end;
    padding: 0;
  }

  .notifications-modal__content {
    width: 100%;
  }
}
</style>
