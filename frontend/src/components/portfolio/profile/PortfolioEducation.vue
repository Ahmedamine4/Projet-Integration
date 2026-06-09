<script setup>
import { GraduationCap, Plus } from 'lucide-vue-next';
import PortfolioEmptyState from '@/components/portfolio/shared/PortfolioEmptyState.vue';

defineProps({
  userId: { type: String, required: true },
  canAdd: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['add-education']);
</script>

<template>
  <div class="education">
    <header>
      <h2>Education</h2>
    </header>
    <div class="education__body">
      <article
        v-for="item in items"
        :key="item.id"
        class="education__item"
      >
        <div
          class="education__icon"
          aria-hidden="true"
        >
          <GraduationCap
            :size="18"
            :stroke-width="1.9"
          />
        </div>
        <div class="education__content">
          <div class="education__heading">
            <h3>{{ item.school }}</h3>
            <span>{{ item.period }}</span>
          </div>
          <p class="education__degree">
            {{ item.level }}
          </p>
          <p class="education__description">
            {{ item.description }}
          </p>
        </div>
      </article>
      <div
        v-if="!items.length && canAdd"
        class="education__empty education__empty--actionable"
      >
        <p>No education information has been added yet.</p>
        <button
          class="education__empty-action"
          type="button"
          @click="$emit('add-education')"
        >
          <Plus :size="15" />
          Add academic path
        </button>
      </div>
      <PortfolioEmptyState
        v-else-if="!items.length"
        class="education__empty"
        message="No education information has been added yet."
      />
    </div>
  </div>
</template>

<style scoped>
.education {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  flex-direction: column;
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.04);
  background-color: rgba(var(--color-surface-rgb), 0.3);
}

.education header {
  border-bottom: var(--border);
  padding: 1.38rem var(--space-xl);
}

.education header h2 {
  margin: 0;
  font-weight: var(--font-bold);
  line-height: 1;
  font-size: var(--font-size-lg);
}

.education__body {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
}

.education__item {
  display: grid;
  grid-template-columns: 2.35rem 1fr;
  gap: var(--space-lg);
  align-items: start;
}

.education__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 50%;
  color: rgba(var(--color-primary-rgb), 0.68);
}

.education__content {
  display: grid;
  gap: var(--space-xs);
  min-width: 0;
}

.education__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}

.education__heading h3,
.education__content p {
  margin: 0;
}

.education__heading h3 {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.2;
}

.education__heading span {
  flex: 0 0 auto;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.education__degree {
  color: rgba(var(--color-primary-rgb), 0.76);
  font-size: var(--font-size-xs);
  font-weight: var(--font-regular);
}

.education__description {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xs);
  font-weight: var(--font-light);
  line-height: 1.3;
}

.education__empty {
  text-align: center;
}

.education__empty--actionable {
  display: grid;
  place-items: center;
  gap: var(--space-md);
  padding: var(--space-xl);
  border: 1.5px dashed rgba(var(--color-primary-rgb), 0.22);
  border-radius: var(--radius-md);
  background: rgba(var(--color-background-rgb), 0.35);
  color: rgba(var(--color-primary-rgb), 0.56);
}

.education__empty--actionable p {
  margin: 0;
  color: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.education__empty-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  padding-block: var(--space-sm);
  padding-inline: 0.75rem var(--space-md);
  background-color: var(--color-primary);
  color: var(--color-background);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
  font: inherit;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.education__empty-action:hover {
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
  transform: translateY(-1px);
}

.education__empty-action:focus-visible {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

</style>
