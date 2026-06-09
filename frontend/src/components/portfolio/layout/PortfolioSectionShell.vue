<script setup>
import { Plus } from 'lucide-vue-next';

defineProps({
  title: {
    type: String,
    required: true,
  },
  addLabel: {
    type: String,
    default: '',
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
  isEmpty: {
    type: Boolean,
    default: false,
  },
  emptyLabel: {
    type: String,
    default: 'Nothing here yet',
  },
});

const emit = defineEmits(['add']);
</script>

<template>
  <section class="portfolio-section-shell">
    <div class="portfolio-section-header">
      <div class="portfolio-section-title">
        {{ title }}
      </div>
      <button
        v-if="canAdd"
        type="button"
        class="portfolio-section-add-button"
        @click="emit('add')"
      >
        <Plus :size="15" />
        {{ addLabel }}
      </button>
      <slot name="actions" />
    </div>

    <slot v-if="!isEmpty" />

    <div
      v-else
      class="portfolio-section-empty"
    >
      <div class="empty-state">
        <p>{{ emptyLabel }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.portfolio-section-shell {
  --padding-block: calc(var(--space-xl) * 1.5);
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  position: relative;
  width: 100%;
  height: fit-content;
  border-bottom: var(--border);
  border-radius: 0;
  background: var(--color-background);
  padding: 0;
}

.portfolio-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-lg);
}

.portfolio-section-title {
  position: relative;
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-editorial);
  font-size: 2.45rem;
  font-weight: var(--font-medium);
  line-height: 1;
  letter-spacing: 0;
}

.portfolio-section-add-button {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border: none;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-background);
  padding-block: var(--space-sm);
  padding-inline: 0.75rem var(--space-md);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.portfolio-section-add-button:hover {
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
  transform: translateY(-1px);
}

.portfolio-section-empty {
  display: grid;
  place-items: center;
  min-height: 12rem;
  padding-block: var(--padding-block);
  text-align: center;
}

.empty-state {
  display: grid;
  place-items: center;
  width: min(100%, 28rem);
  padding: var(--space-xl);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  background: rgba(var(--color-surface-rgb), 0.22);
}

.empty-state p {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-family: var(--font-editorial);
  font-size: 1.45rem;
  font-weight: var(--font-medium);
}

@media (max-width: 820px) {
  .portfolio-section-title {
    font-size: 2.15rem;
  }
}

@media (max-width: 640px) {
  .portfolio-section-title {
    font-size: 1.75rem;
  }
}
</style>
