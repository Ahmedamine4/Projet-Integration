<script setup>
import { computed } from 'vue';

import FeedModalShell from '@/components/feed/FeedModalShell.vue';

const props = defineProps({
  offer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'apply']);

const modalDescription = computed(() => {
  if (!props.offer) return '';

  return [props.offer.company, props.offer.location].filter(Boolean).join(' - ');
});

function handleApply() {
  if (props.offer) {
    emit('apply', props.offer);
  }
}
</script>

<template>
  <FeedModalShell
    :open="!!offer"
    :title="offer?.title || ''"
    :description="modalDescription"
    size="md"
    @close="emit('close')"
  >
    <div
      v-if="offer"
      class="offer-detail-content"
    >
      <section class="offer-summary-grid">
        <div class="offer-summary-item">
          <span>Company</span>
          <strong>{{ offer.company || 'Not specified' }}</strong>
        </div>

        <div class="offer-summary-item">
          <span>Location</span>
          <strong>{{ offer.location || 'Not specified' }}</strong>
        </div>

        <div class="offer-summary-item">
          <span>Duration</span>
          <strong>{{ offer.duration || 'Not specified' }}</strong>
        </div>

        <div class="offer-summary-item">
          <span>Level</span>
          <strong>{{ offer.level || 'Not specified' }}</strong>
        </div>
      </section>

      <section
        v-if="offer.technologies?.length"
        class="offer-section"
      >
        <h3>Technologies</h3>

        <div class="tech-list">
          <span
            v-for="tech in offer.technologies"
            :key="tech"
          >
            {{ tech }}
          </span>
        </div>
      </section>

      <section class="offer-section">
        <h3>Description</h3>

        <p>
          {{ offer.description || 'No description available.' }}
        </p>
      </section>
    </div>

    <template #footer>
      <button
        type="button"
        class="feed-modal-button feed-modal-button--secondary"
        @click="emit('close')"
      >
        Close
      </button>

      <button
        type="button"
        class="feed-modal-button feed-modal-button--primary"
        @click="handleApply"
      >
        Apply
      </button>
    </template>
  </FeedModalShell>
</template>

<style scoped>
.offer-detail-content {
  display: grid;
  gap: var(--space-lg);
}

.offer-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}

.offer-summary-item {
  display: grid;
  gap: 0.25rem;
  padding: var(--space-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  background: rgba(var(--color-background-rgb), 0.48);
}

.offer-summary-item span,
.offer-section h3 {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.offer-summary-item strong {
  color: rgba(var(--color-primary-rgb), 0.84);
  font-size: var(--font-size-xs);
  line-height: 1.35;
}

.offer-section {
  display: grid;
  gap: var(--space-xs);
}

.offer-section h3 {
  margin: 0;
}

.offer-section p {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.66);
  font-size: var(--font-size-xs);
  line-height: 1.6;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-list span {
  padding: 0.24rem 0.58rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: rgba(var(--color-background-rgb), 0.62);
  color: rgba(var(--color-primary-rgb), 0.64);
  font-size: 10px;
  font-weight: var(--font-medium);
}

.feed-modal-button {
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0 var(--space-md);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.feed-modal-button:hover {
  transform: translateY(-1px);
}

.feed-modal-button--primary {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-background);
}

.feed-modal-button--secondary {
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.66);
}

@media (max-width: 520px) {
  .offer-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
