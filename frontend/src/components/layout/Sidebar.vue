<script setup>
import { ref, computed } from 'vue';
import FolioCraftLogo from '@/assets/icons/FolioCraft.svg';
import {
  LayoutDashboard,
  PanelLeftOpen,
  PanelLeftClose,
  UserRound,
  FolderKanban,
  CalendarDays,
  FolderOpen,
  Bell,
  Settings,
  LogOut,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

defineProps({
  user: {
    type: Object,
    default: () => ({
      id: 1,
      firstName: 'User',
      lastName: '',
      role: 'Student',
    }),
  },
});

const collapsed = ref(true);

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Profile', icon: UserRound },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Activities', icon: CalendarDays },
  { label: 'Portfolio', icon: FolderOpen },
  { label: 'Settings', icon: Settings },
];

const selected = ref('Dashboard');

const activeIndex = computed(() => {
  const index = sidebarItems.findIndex((item) => item.label === selected.value);
  return index >= 0 ? index : 0;
});

const thumbStyle = computed(() => {
  return {
    '--active-index': activeIndex.value,
  };
});

async function handleLogout() {
  try {
    await authStore.logout();
  } finally {
    router.replace('/login');
  }
}
</script>

<template>
  <div class="sidebar-space" :class="{ collapsed }">
    <div class="sidebar-overlay" @click="collapsed = true" />
    <aside class="sidebar">
      <header>
        <div class="brand">
          <img :src="FolioCraftLogo" />
        </div>

        <button class="sidebar__toggle" @click="collapsed = !collapsed">
          <PanelLeftOpen v-if="collapsed" />
          <PanelLeftClose v-else />
        </button>
      </header>

      <nav>
        <span class="sidebar__thumb" :style="thumbStyle"> </span>
        <button
          class="sidebar__item"
          v-for="item in sidebarItems"
          :key="item.label"
          :class="{ selected: item.label === selected }"
          @click="selected = item.label"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <footer>
        <div class="sidebar__account">
          <span class="sidebar__avatar">
            {{ user?.firstName?.[0] || 'U' }}
          </span>
          <span class="sidebar__user">
            {{ user.firstName || 'User' }}
          </span>
          <button class="sidebar__notification">
            <Bell />
          </button>
        </div>
        <button class="sidebar__item" @click="handleLogout">
          <LogOut />
          <span>Log out</span>
        </button>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.sidebar-space {
  --collapsed-sidebar-width: calc(38px + 2 * var(--space-sm));
  position: sticky;
  top: 0;
  left: 0;
  flex-shrink: 0;
  z-index: 800;
  width: 208px;
  height: 100vh;
  transition: width var(--transition-normal);
}

.sidebar {
  display: flex;
  flex-direction: column;
  width: 208px;
  height: 100%;
  padding: var(--space-sm);
  background: var(--color-primary);
  color: var(--color-background);
  transition: width var(--transition-normal);
}

.sidebar > header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px;
  align-items: center;
  gap: var(--space-md);
  min-height: 64px;
  margin-top: calc(var(--space-sm) * -1);
  margin-inline: calc(var(--space-sm) * -1);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-primary-hover);
  padding: var(--space-sm);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.brand img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: invert(98%);
  opacity: 1;
  margin-left: var(--space-sm);
  transition: opacity var(--transition-normal);
}

.sidebar__toggle,
.sidebar__notification {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: end;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: rgba(var(--color-background-rgb), 0.76);
  cursor: pointer;
}

.sidebar > nav,
.sidebar > footer {
  display: grid;
  position: relative;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.sidebar__thumb {
  position: absolute;
  background: var(--color-background);
  z-index: 1000;
  width: 10px;
  height: 25px;
  border-radius: 999px;
  left: -14px;
  top: calc(6px + var(--active-index) * (var(--space-sm) + 38px));
  transition: top 0.4s var(--ease-overshoot);
}

.sidebar__item {
  position: relative;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  width: 100%;
  height: 38px;
  column-gap: var(--space-md);
  padding: 0 var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
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

.sidebar__toggle svg,
.sidebar__item svg,
.sidebar__notification svg {
  width: 15px;
  height: 15px;
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
  font-size: var(--font-size-xxs);
  white-space: nowrap;
  transition:
    max-width var(--transition-normal),
    opacity var(--transition-fast);
}

.sidebar__notification:hover,
.sidebar__toggle:hover,
.sidebar__item:hover {
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
  margin-block: auto calc(var(--space-sm) * -1);
  margin-inline: calc(var(--space-sm) * -1);
  border-top: 1px solid var(--color-primary-hover);
  padding: var(--space-sm);
}

.sidebar__account {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 38px;
  align-items: center;
  column-gap: var(--space-md);
  min-height: 38px;
  overflow: hidden;
  transition: column-gap var(--transition-normal);
}

.sidebar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-secondary);
  color: var(--color-background);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  margin-left:
    calc((var(--collapsed-sidebar-width) - 24px) / 2 - var(--space-sm));
}

.sidebar-space.collapsed,
.sidebar-space.collapsed .sidebar {
  width: var(--collapsed-sidebar-width);
}

.collapsed .brand img,
.collapsed .sidebar__item span,
.collapsed .sidebar__user {
  opacity: 0;
}

.collapsed .sidebar__account,
.collapsed .sidebar__item {
  column-gap: 0;
}

.collapsed .sidebar__item {
  width: 38px;
}

.collapsed .sidebar__toggle {
  transform: translateX(-0.75rem);
}

.collapsed .sidebar__user,
.collapsed .sidebar__notification {
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
</style>
