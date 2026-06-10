<script setup>
import { computed, ref } from 'vue';
import FolioCraftLogo from '@/assets/icons/FolioCraft.svg';
import {
  LayoutDashboard,
  PanelLeftOpen,
  PanelLeftClose,
  Menu,
  Compass,
  UserRound,
  FolderOpen,
  Bell,
  Settings,
  LogOut,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

defineProps({
  user: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  notificationsOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['open-notifications', 'update:collapsed']);

const collapsed = ref(true);

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Getting started', icon: Compass, path: '/getting-started' },
  { label: 'Profile', icon: UserRound },
  { label: 'Portfolio', icon: FolderOpen, path: '/portfolio' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

function isItemActive(item) {
  if (!item.path) return false;

  return route.path === item.path || route.path.startsWith(`${item.path}/`);
}

const activeIndex = computed(() => {
  const index = sidebarItems.findIndex(isItemActive);
  return index >= 0 ? index : 0;
});

const thumbStyle = computed(() => {
  return {
    '--active-index': activeIndex.value,
  };
});

function selectItem(item) {
  if (!item.path) return;

  router.push(item.path);
}

function setCollapsed(value) {
  collapsed.value = value;
  emit('update:collapsed', value);
}

function toggleSidebar() {
  setCollapsed(!collapsed.value);
}

function toggleNotifications() {
  emit('open-notifications');
}

async function handleLogout() {
  try {
    await authStore.logout();
  } finally {
    router.replace('/login');
  }
}
</script>

<template>
  <div
    class="sidebar-space"
    :class="{ collapsed, 'is-loading': loading, 'notifications-open': notificationsOpen }"
  >
    <button
      class="mobile-toggle"
      @click="setCollapsed(false)"
    >
      <Menu :size="20" />
    </button>
    <div
      class="sidebar-overlay"
      @click="setCollapsed(true)"
    />
    <aside class="sidebar">
      <header>
        <div class="brand">
          <img
            :src="FolioCraftLogo"
            draggable="false"
          >
        </div>

        <button
          class="sidebar__toggle"
          @click="toggleSidebar"
        >
          <PanelLeftOpen v-if="collapsed" />
          <PanelLeftClose v-else />
        </button>
      </header>

      <nav>
        <span
          class="sidebar__thumb"
          :style="thumbStyle"
        />
        <button
          v-for="item in sidebarItems"
          :key="item.label"
          class="sidebar__item"
          :class="{ selected: isItemActive(item) }"
          @click="selectItem(item)"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <footer>
        <div
          v-if="loading"
          class="sidebar__account sidebar__account--loading"
          aria-hidden="true"
        >
          <span class="sidebar__avatar sidebar-skeleton" />
          <span class="sidebar__user sidebar-skeleton sidebar-skeleton--name" />
          <span class="sidebar__notification sidebar-skeleton sidebar-skeleton--icon" />
        </div>
        <div
          v-else
          class="sidebar__account"
        >
          <span class="sidebar__avatar">
            {{ user?.firstName?.[0] || 'U' }}
          </span>
          <span class="sidebar__user">
            {{ user?.firstName || 'User' }}
          </span>
          <button
            class="sidebar__notification"
            title="Notifications"
            aria-label="Ouvrir ou fermer les notifications"
            :aria-pressed="notificationsOpen"
            @click="toggleNotifications"
          >
            <Bell />
            <span
              class="sidebar__notification-dot"
              aria-hidden="true"
            />
          </button>
        </div>
        <button
          class="sidebar__item"
          @click="handleLogout"
        >
          <LogOut />
          <span>Log out</span>
        </button>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.sidebar-space {
  --sidebar-padding: var(--space-sm);
  --sidebar-width: 208px;
  --sidebar-rail-width: 38px;
  --sidebar-icon-size: 15px;
  --sidebar-media-size: 24px;
  --sidebar-text-size: var(--font-size-xxs);
  --sidebar-item-padding-inline: var(--space-sm);
  --sidebar-item-border-radius: calc(var(--sidebar-rail-width) * 0.21);
  --sidebar-account-gap: var(--space-lg);
  --sidebar-thumb-height: calc(var(--sidebar-rail-width) * 25 / 38);
  --sidebar-thumb-width: calc(var(--sidebar-thumb-height) * 0.4);
  --sidebar-nav-gap: var(--space-sm);
  --sidebar-nav-margin-block: var(--space-md);
  --collapsed-sidebar-width: calc(
    var(--sidebar-rail-width) + 2 * var(--space-sm)
  );
  position: sticky;
  top: 0;
  left: 0;
  flex-shrink: 0;
  z-index: 800;
  width: var(--sidebar-width);
  height: 100vh;
  transition: width var(--transition-normal);
}

.sidebar {
  --border-color: color-mix(
    in srgb,
    var(--color-primary) 92%,
    var(--color-background)
  );
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  height: 100%;
  padding: var(--sidebar-padding);
  background: var(--color-primary);
  color: var(--color-background);
  transition: width var(--transition-normal);
}

.sidebar > header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--sidebar-rail-width);
  align-items: center;
  gap: var(--space-md);
  margin-top: calc(var(--sidebar-padding) * -1);
  margin-inline: calc(var(--sidebar-padding) * -1);
  border-bottom: 1px solid var(--border-color);
  padding: var(--sidebar-padding);
}

.mobile-toggle {
  position: fixed;
  top: var(--sidebar-padding);
  left: var(--sidebar-padding);
  width: 2.75rem;
  height: 2.75rem;
  display: none;
  place-items: center;
  padding: 0;
  border-radius: var(--space-sm);
  border: none;
  background:
    radial-gradient(
      circle at center,
      rgba(var(--color-surface-rgb), 0.78),
      rgba(var(--color-surface-rgb), 0)
    );
  color: var(--color-primary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.mobile-toggle:hover {
  background: rgba(var(--color-surface-rgb), 0.9);
}

.mobile-toggle:active {
  transform: scale(0.96);
}

.mobile-toggle:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 3px;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.brand img {
  width: var(--sidebar-media-size);
  height: var(--sidebar-media-size);
  object-fit: contain;
  filter: invert(98%);
  user-select: none;
  opacity: 1;
  margin-left: var(--space-sm);
  transition: opacity var(--transition-normal);
}

.sidebar__toggle,
.sidebar__notification {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: end;
  width: var(--sidebar-rail-width);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: rgba(var(--color-background-rgb), 0.76);
  cursor: pointer;
}

.sidebar-space.notifications-open {
  z-index: 1300;
}

.sidebar__toggle {
  aspect-ratio: 1;
}

.sidebar__notification {
  aspect-ratio: 1;
}

.sidebar__notification-dot {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 7px;
  height: 7px;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  background: var(--color-error);
}

.sidebar > :is(nav, footer) {
  display: grid;
  gap: var(--sidebar-nav-gap);
}

.sidebar nav {
  position: relative;
  margin-block: var(--sidebar-nav-margin-block);
}

.sidebar__thumb {
  position: absolute;
  background: var(--color-background);
  z-index: 1000;
  width: var(--sidebar-thumb-width);
  height: var(--sidebar-thumb-height);
  border-radius: 999px;
  left: calc(
    (var(--sidebar-thumb-width) / -2)
    - var(--sidebar-padding)
  );
  top: calc(
    (var(--sidebar-rail-width) - var(--sidebar-thumb-height)) / 2
    + var(--active-index) * (var(--sidebar-nav-gap) + var(--sidebar-rail-width))
  );
  transition: top 0.4s var(--ease-overshoot);
}

.sidebar__item {
  position: relative;
  display: grid;
  grid-template-columns: var(--sidebar-media-size) minmax(0, 1fr);
  align-items: center;
  width: 100%;
  height: var(--sidebar-rail-width);
  column-gap: var(--space-md);
  padding: 0 var(--sidebar-item-padding-inline);
  border: none;
  border-radius: var(--sidebar-item-border-radius);
  background: transparent;
  color: rgba(var(--color-background-rgb), 0.76);
  text-align: left;
  cursor: pointer;
  transition: column-gap var(--transition-normal);
}

.sidebar__item.selected {
  background: rgba(var(--color-background-rgb), 0.08);
  color: var(--color-background);
}

:is(
  .sidebar__toggle,
  .sidebar__item,
  .sidebar__notification
) svg {
  width: var(--sidebar-icon-size);
  height: var(--sidebar-icon-size);
  place-self: center;
}

.sidebar__item svg {
  transform: translateX(-1px);
}

.sidebar__toggle svg {
  opacity: 0.7;
}

.sidebar__user,
.sidebar__item span {
  overflow: hidden;
  max-width: 120px;
  opacity: 1;
  font: inherit;
  font-size: var(--sidebar-text-size);
  white-space: nowrap;
  transition:
    max-width var(--transition-normal),
    opacity var(--transition-fast);
}

:is(
  .sidebar__notification,
  .sidebar__toggle,
  .sidebar__item
):hover {
  background: rgba(var(--color-background-rgb), 0.08);
  color: var(--color-background);
  transform: translateY(-1px);
}

.sidebar__notification,
.sidebar__toggle,
.sidebar__item {
  transition: var(--transition-normal);
}

.sidebar > footer {
  margin-block: auto calc(var(--sidebar-padding) * -1);
  margin-inline: calc(var(--sidebar-padding) * -1);
  border-top: 1px solid var(--border-color);
  padding: var(--sidebar-padding);
}

.sidebar__account {
  display: grid;
  grid-template-columns: var(--sidebar-media-size) minmax(0, 1fr) var(--sidebar-rail-width);
  align-items: center;
  column-gap: var(--sidebar-account-gap);
  min-height: var(--sidebar-rail-width);
  transition: column-gap var(--transition-normal);
}

.sidebar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--sidebar-media-size);
  height: var(--sidebar-media-size);
  border-radius: 50%;
  background-color: var(--color-secondary);
  color: var(--color-background);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  margin-left:
    calc(
      (var(--collapsed-sidebar-width) - var(--sidebar-media-size)) / 2
      - var(--sidebar-padding)
  );
}

.sidebar__account--loading {
  pointer-events: none;
}

.sidebar-skeleton {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(var(--color-background-rgb), 0.12);
  color: transparent;
}

.sidebar-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--color-background-rgb), 0.24),
    transparent
  );
  animation: sidebar-skeleton-shimmer 1.35s ease-in-out infinite;
}

.sidebar-skeleton--name {
  width: 4.8rem;
  height: 0.72rem;
  align-self: center;
  border-radius: 999px;
}

.sidebar-skeleton--icon {
  justify-self: end;
  cursor: default;
}

@keyframes sidebar-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

.sidebar-space.collapsed,
.sidebar-space.collapsed .sidebar {
  width: var(--collapsed-sidebar-width);
}

.collapsed .sidebar__toggle {
  transform: translateX(-1rem);
}

.collapsed :is(
  .brand img,
  .sidebar__item span,
  .sidebar__user
) {
  opacity: 0;
}

.collapsed :is(.sidebar__account, .sidebar__item) {
  column-gap: 0;
}

.collapsed .sidebar__account {
  grid-template-columns: var(--sidebar-rail-width);
  grid-template-rows: var(--sidebar-rail-width) var(--sidebar-rail-width);
  justify-items: center;
  row-gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.collapsed .sidebar__notification {
  grid-row: 1;
  justify-self: center;
}

.collapsed .sidebar__avatar {
  grid-row: 2;
  margin-left: 0;
}

.collapsed .sidebar__item {
  width: var(--sidebar-rail-width);
}

.collapsed .sidebar__user {
  max-width: 0;
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 768px) {
  .sidebar-space {
    position: relative;
    width: var(--collapsed-sidebar-width);
  }
  .sidebar {
    position: fixed;
    z-index: 1;
  }
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(var(--color-primary-rgb), 0.3);
    z-index: 0;
    pointer-events: auto;
    transition: background-color var(--transition-normal);
  }
  .collapsed .sidebar-overlay {
    background-color: transparent;
    pointer-events: none;
  }
}

@media (max-width: 480px) {
  .sidebar-space {
    --sidebar-padding: var(--space-md);
    --sidebar-width: min(82vw, 20rem);
    --sidebar-rail-width: 48px;
    --sidebar-icon-size: 20px;
    --sidebar-media-size: 32px;
    --sidebar-account-gap: var(--space-xl);
    --sidebar-text-size: var(--font-size-md);
    --sidebar-item-padding-inline: var(--space-md);
    --sidebar-nav-margin-block: var(--space-lg);
  }

  .sidebar-space,
  .sidebar-space.collapsed {
    width: 0;
  }

  .sidebar {
    width: var(--sidebar-width);
    transform: translateX(0);
    transition: var(--transition-normal);
  }

  .sidebar-space.collapsed .sidebar {
    transform: translateX(-100%);
  }

  .mobile-toggle {
    display: initial;
  }

  .sidebar__avatar {
    margin-left: 14px;
  }
}
</style>
