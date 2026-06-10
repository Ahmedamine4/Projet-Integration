<script setup>
import { computed } from 'vue';

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['open']);

const fullName = computed(() => {
  const user = props.notification.sourceUser;

  if (!user) {
    return 'Utilisateur';
  }

  return `${user.firstName} ${user.lastName}`.trim();
});

const initials = computed(() => {
  const user = props.notification.sourceUser;

  if (!user) {
    return 'U';
  }

  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
    .trim()
    .toUpperCase() || 'U';
});

const relativeDate = computed(() => {
  const date = new Date(props.notification.createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 1) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  if (diffHours >= 1) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }

  return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
});

function handleOpen() {
  emit('open', props.notification.id);
}
</script>

<template>
  <button
    type="button"
    class="notification-item"
    :class="{
      'notification-item--unread': !notification.read,
      'notification-item--expanded': expanded,
    }"
    :aria-expanded="expanded"
    @click="handleOpen"
  >
    <span
      class="notification-item__avatar"
      aria-hidden="true"
    >
      <img
        v-if="notification.sourceUser?.avatar"
        :src="notification.sourceUser.avatar"
        :alt="fullName"
        class="notification-item__avatar-image"
      >
      <span
        v-else
        class="notification-item__avatar-fallback"
      >
        {{ initials }}
      </span>
    </span>

    <span class="notification-item__content">
      <span class="notification-item__message">
        <strong class="notification-item__name">{{ fullName }}</strong>
        <span class="notification-item__text">
          {{ notification.message }}
        </span>
      </span>
      <span class="notification-item__meta">
        {{ relativeDate }}
      </span>
    </span>

    <span
      v-if="!notification.read"
      class="notification-item__dot"
      aria-label="Notification non lue"
    />
  </button>
</template>

<style scoped>
.notification-item {
  position: relative;
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 12px;
  align-items: start;
  gap: 12px;
  padding: 12px 8px 12px 10px;
  border: 0;
  border-left: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.notification-item:hover {
  transform: none;
  background: transparent;
  box-shadow: none;
}

.notification-item:focus-visible {
  outline: none;
  border-left-color: rgba(var(--color-secondary-rgb), 0.55);
  box-shadow: 0 0 0 4px rgba(var(--color-secondary-rgb), 0.14);
}

.notification-item--unread {
  background: transparent;
}

.notification-item--expanded {
  border-left-color: var(--color-secondary);
  border-radius: var(--radius-sm);
  background: rgba(var(--color-primary-rgb), 0.035);
}

.notification-item__avatar {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: #2563eb;
}

.notification-item__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notification-item__avatar-fallback {
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.notification-item__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.notification-item__message {
  display: -webkit-box;
  color: var(--color-primary);
  font-size: 0.88rem;
  font-weight: var(--font-regular);
  line-height: 1.38;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.notification-item--expanded .notification-item__message {
  display: inline;
  overflow: visible;
  -webkit-line-clamp: unset;
}

.notification-item__name {
  font-weight: var(--font-bold);
}

.notification-item__text {
  margin-left: 4px;
  color: rgba(var(--color-primary-rgb), 0.72);
}

.notification-item__meta {
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: var(--font-size-xs);
  font-weight: var(--font-regular);
  line-height: 1.2;
}

.notification-item__dot {
  justify-self: end;
  align-self: center;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-error);
  box-shadow: none;
}

@media (max-width: 520px) {
  .notification-item {
    min-height: 56px;
    grid-template-columns: 32px minmax(0, 1fr) 12px;
    gap: 12px;
    padding: 12px 8px 12px 10px;
  }

  .notification-item__avatar {
    width: 32px;
    height: 32px;
  }

  .notification-item__message {
    font-size: 0.88rem;
  }
}
</style>
