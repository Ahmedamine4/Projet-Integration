<template>
  <header class="feed-header">
    <div class="header-left">
      <span class="discovery-label">Découverte</span>
      <h1 class="greeting">Bonjour {{ userName }} 👋</h1>
    </div>

    <div class="header-center">
      <div class="search-wrapper">
        <Search class="search-icon" :size="16" />
        <input
          class="search-input"
          type="text"
          placeholder="Rechercher un projet, un étudiant ou une technologie..."
          :value="search"
          @input="emit('update:search', $event.target.value)"
        />
        <span class="search-hint">Ctrl K</span>
      </div>
    </div>

    <div class="header-right">
      <button class="notif-btn" aria-label="Notifications">
        <Bell :size="18" />
        <span class="notif-dot" />
      </button>
      <button class="create-btn" @click="emit('create-project')">
        <Plus :size="16" />
        <span>Nouveau Projet</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { Search, Bell, Plus } from 'lucide-vue-next';

const props = defineProps({
  userName: { type: String, default: 'Étudiant' },
  search: { type: String, default: '' },
});

const emit = defineEmits(['update:search', 'create-project']);
</script>

<style scoped>
.feed-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  background: rgba(var(--color-surface-rgb), 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  min-height: 60px;
  z-index: 10;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 150px;
}

.discovery-label {
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--color-secondary-rgb), 1);
  line-height: 1;
}

.greeting {
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: rgba(var(--color-primary-rgb), 0.85);
  margin: 0;
  white-space: nowrap;
}

.header-center {
  flex: 1;
  max-width: 480px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: rgba(var(--color-primary-rgb), 0.38);
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 7px 70px 7px 34px;
  background: rgba(var(--color-background-rgb), 0.7);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.85);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input::placeholder {
  color: rgba(var(--color-primary-rgb), 0.35);
}

.search-input:focus {
  border-color: rgba(var(--color-secondary-rgb), 0.45);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.1);
}

.search-hint {
  position: absolute;
  right: 10px;
  font-size: var(--font-size-xxs);
  color: rgba(var(--color-primary-rgb), 0.3);
  background: rgba(var(--color-primary-rgb), 0.06);
  padding: 2px 5px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-left: auto;
}

.notif-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: rgba(var(--color-background-rgb), 0.7);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  color: rgba(var(--color-primary-rgb), 0.65);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  flex-shrink: 0;
}

.notif-btn:hover {
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-secondary-rgb), 1);
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(var(--color-secondary-rgb), 1);
  border: 1.5px solid rgba(var(--color-surface-rgb), 1);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(var(--color-secondary-rgb), 1);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition: opacity var(--transition-fast), box-shadow var(--transition-fast);
}

.create-btn:hover {
  opacity: 0.88;
  box-shadow: 0 3px 10px rgba(var(--color-secondary-rgb), 0.3);
}

@media (max-width: 760px) {
  .feed-header {
    flex-wrap: wrap;
    padding: var(--space-xs) var(--space-md);
    gap: var(--space-xs);
  }
  .header-center {
    order: 3;
    max-width: 100%;
    width: 100%;
  }
  .create-btn span {
    display: none;
  }
  .create-btn {
    padding: 7px 10px;
  }
}
</style>