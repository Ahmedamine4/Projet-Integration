<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import NotificationItem from '@/components/NotificationItem.vue';
import {
  getNotifications,
  markNotificationAsRead,
} from '@/services/notificationService';

const props = defineProps({
  endpoint: {
    type: String,
    default: '/notifications',
  },
});

const notifications = ref([]);
const activeFilter = ref('all');
const loading = ref(false);
const error = ref('');
const markingAllAsRead = ref(false);
const expandedNotificationId = ref('');
const visibleReadNotificationIds = ref([]);

const unreadCount = computed(
  () => notifications.value.filter((notification) => !notification.read).length,
);

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') {
    return notifications.value.filter(
      (notification) => !notification.read
        || visibleReadNotificationIds.value.includes(notification.id),
    );
  }

  return notifications.value;
});

const groupedNotifications = computed(() => {
  const groups = [];

  filteredNotifications.value.forEach((notification, index) => {
    const label = index < 2 ? '' : formatGroupDate(notification.createdAt);
    const currentGroup = groups[groups.length - 1];

    if (!currentGroup || currentGroup.label !== label) {
      groups.push({
        label,
        items: [notification],
      });

      return;
    }

    currentGroup.items.push(notification);
  });

  return groups;
});

const emptyMessage = computed(() => {
  if (activeFilter.value === 'unread') {
    return 'Aucune notification non lue.';
  }

  return 'Aucune notification pour le moment.';
});

async function loadNotifications() {
  loading.value = true;
  error.value = '';

  try {
    notifications.value = await getNotifications(props.endpoint);
  } catch {
    error.value = 'Impossible de charger les notifications.';
  } finally {
    loading.value = false;
  }
}

function setNotificationReadState(notificationId, read) {
  const notification = notifications.value.find((item) => item.id === notificationId);

  if (notification) {
    notification.read = read;
  }
}

function setActiveFilter(filter) {
  activeFilter.value = filter;
  expandedNotificationId.value = '';
  visibleReadNotificationIds.value = [];
}

async function openNotification(notificationId) {
  const notification = notifications.value.find((item) => item.id === notificationId);

  if (!notification) {
    return;
  }

  expandedNotificationId.value = notificationId;

  if (notification.read) {
    return;
  }

  if (activeFilter.value === 'unread') {
    visibleReadNotificationIds.value = [
      ...visibleReadNotificationIds.value,
      notificationId,
    ];
  }

  setNotificationReadState(notificationId, true);

  try {
    await markNotificationAsRead(notificationId);
  } catch {
    setNotificationReadState(notificationId, false);
    error.value = 'La notification n\'a pas pu etre marquee comme lue.';
  }
}

async function markUnreadNotificationsAsRead() {
  const unreadIds = notifications.value
    .filter((notification) => !notification.read)
    .map((notification) => notification.id);

  if (!unreadIds.length) {
    return;
  }

  markingAllAsRead.value = true;
  error.value = '';
  unreadIds.forEach((notificationId) => setNotificationReadState(notificationId, true));

  const results = await Promise.allSettled(
    unreadIds.map((notificationId) => markNotificationAsRead(notificationId)),
  );

  const failedIds = unreadIds.filter((_, index) => results[index].status === 'rejected');

  failedIds.forEach((notificationId) => setNotificationReadState(notificationId, false));

  if (failedIds.length) {
    error.value = 'Certaines notifications n\'ont pas pu etre marquees comme lues.';
  }

  markingAllAsRead.value = false;
}

function formatGroupDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

watch(
  () => props.endpoint,
  () => {
    setActiveFilter('all');
    expandedNotificationId.value = '';
    loadNotifications();
  },
);

onMounted(loadNotifications);
</script>

<template>
  <section
    class="notifications-panel"
    aria-labelledby="notifications-title"
  >
    <header class="notifications-panel__header">
      <h2
        id="notifications-title"
        class="notifications-panel__title"
      >
        Notification
      </h2>
    </header>

    <div class="notifications-panel__controls">
      <div
        class="notifications-panel__tabs"
        role="tablist"
        aria-label="Filtres de notifications"
      >
        <button
          type="button"
          class="notifications-panel__tab"
          :class="{ 'notifications-panel__tab--active': activeFilter === 'all' }"
          :aria-selected="activeFilter === 'all'"
          role="tab"
          @click="setActiveFilter('all')"
        >
          All ({{ notifications.length }})
        </button>
        <button
          type="button"
          class="notifications-panel__tab"
          :class="{ 'notifications-panel__tab--active': activeFilter === 'unread' }"
          :aria-selected="activeFilter === 'unread'"
          role="tab"
          @click="setActiveFilter('unread')"
        >
          Unread
        </button>
      </div>

      <button
        type="button"
        class="notifications-panel__mark-all"
        :disabled="!unreadCount || markingAllAsRead"
        @click="markUnreadNotificationsAsRead"
      >
        <template v-if="markingAllAsRead">
          Updating...
        </template>
        <template v-else>
          &check; Mark All As Read
        </template>
      </button>
    </div>

    <div class="notifications-panel__body">
      <div
        v-if="loading"
        class="notifications-panel__state"
      >
        <span
          class="notifications-panel__loader"
          aria-hidden="true"
        />
        <span>Chargement des notifications...</span>
      </div>

      <div
        v-else-if="error"
        class="notifications-panel__state notifications-panel__state--error"
      >
        <span>{{ error }}</span>
        <button
          type="button"
          class="notifications-panel__retry"
          @click="loadNotifications"
        >
          Reessayer
        </button>
      </div>

      <div
        v-else-if="!filteredNotifications.length"
        class="notifications-panel__state"
      >
        {{ emptyMessage }}
      </div>

      <div
        v-else
        class="notifications-panel__list"
      >
        <section
          v-for="group in groupedNotifications"
          :key="group.label || 'recent'"
          class="notifications-panel__group"
        >
          <h3
            v-if="group.label"
            class="notifications-panel__group-title"
          >
            {{ group.label }}
          </h3>

          <NotificationItem
            v-for="notification in group.items"
            :key="notification.id"
            :notification="notification"
            :expanded="expandedNotificationId === notification.id"
            @open="openNotification"
          />
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.notifications-panel {
  width: min(100%, 500px);
  height: calc(100vh - 2 * var(--space-sm));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.06);
  border-radius: 12px;
  background: white;
  box-shadow: 0 22px 60px rgba(20, 20, 20, 0.22);
  color: var(--color-primary);
}

.notifications-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 10px;
}

.notifications-panel__title {
  margin: 0;
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: 1.35rem;
  font-weight: var(--font-bold);
  line-height: 1;
}

.notifications-panel__mark-all,
.notifications-panel__retry,
.notifications-panel__tab {
  font: inherit;
  border: 0;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast);
}

.notifications-panel__mark-all {
  flex: 0 0 auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #5b5ce2;
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  white-space: nowrap;
}

.notifications-panel__mark-all:hover:not(:disabled) {
  color: #3434b8;
  text-decoration: underline;
}

.notifications-panel__mark-all:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.notifications-panel__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 0 24px;
  padding: 12px 0 13px;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.notifications-panel__tabs {
  display: flex;
  align-items: center;
  gap: 22px;
  min-width: 0;
}

.notifications-panel__tab {
  position: relative;
  min-height: 28px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}

.notifications-panel__tab--active {
  background: transparent;
  color: var(--color-primary);
  font-weight: var(--font-bold);
  box-shadow: none;
}

.notifications-panel__tab--active::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: -14px;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--color-primary);
}

.notifications-panel__body {
  min-height: 0;
  overflow: hidden;
  padding: 0 24px 24px;
}

.notifications-panel__list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  padding: 10px 2px 0 0;
}

.notifications-panel__group {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.notifications-panel__group:last-child {
  border-bottom: 0;
}

.notifications-panel__group-title {
  margin: 16px 0 4px;
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.notifications-panel__state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px;
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: var(--font-size-sm);
  text-align: center;
}

.notifications-panel__state--error {
  color: var(--color-error);
}

.notifications-panel__loader {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.16);
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  animation: notification-spin 0.75s linear infinite;
}

.notifications-panel__retry {
  padding: 9px 13px;
  border-radius: 999px;
  background: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.notifications-panel__mark-all:focus-visible,
.notifications-panel__retry:focus-visible,
.notifications-panel__tab:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(var(--color-secondary-rgb), 0.16);
}

@keyframes notification-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .notifications-panel {
    width: 100%;
    height: 70vh;
    border-radius: 16px 16px 0 0;
  }

  .notifications-panel__header {
    padding: 20px 18px 10px;
  }

  .notifications-panel__mark-all {
    width: auto;
  }

  .notifications-panel__controls {
    margin: 0 18px;
    gap: 12px;
  }

  .notifications-panel__body {
    padding: 0 18px 18px;
  }

  .notifications-panel__list {
    padding-top: 10px;
  }
}
</style>
