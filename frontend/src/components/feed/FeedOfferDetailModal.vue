<template>
  <Teleport to="body">
    <div
      v-if="offer"
      class="offer-detail-overlay"
      @click.self="emit('close')"
    >
      <section
        class="offer-detail-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
      >
        <header class="offer-detail-header">
          <div class="offer-detail-heading">
            <h2 :id="modalTitleId">
              {{ offer.title }}
            </h2>

            <p>
              {{ offer.company || 'Company not specified' }}
              <span v-if="offer.location">
                · {{ offer.location }}
              </span>
            </p>
          </div>

          <button
            type="button"
            class="offer-detail-close"
            aria-label="Close modal"
            @click="emit('close')"
          >
            <X
              :size="19"
              :stroke-width="2.2"
            />
          </button>
        </header>

        <div class="offer-detail-body">
          <div class="offer-detail-grid">
            <article class="offer-detail-info-card">
              <span>Company</span>
              <strong>{{ offer.company || 'Not specified' }}</strong>
            </article>

            <article class="offer-detail-info-card">
              <span>Location</span>
              <strong>{{ offer.location || 'Not specified' }}</strong>
            </article>

            <article class="offer-detail-info-card">
              <span>Duration</span>
              <strong>{{ offer.duration || 'Not specified' }}</strong>
            </article>

            <article class="offer-detail-info-card">
              <span>Level</span>
              <strong>{{ offer.level || 'Not specified' }}</strong>
            </article>
          </div>

          <section
            v-if="offerTechnologies.length"
            class="offer-detail-section"
          >
            <h3>Technologies</h3>

            <div class="offer-detail-tech-list">
              <span
                v-for="technology in offerTechnologies"
                :key="technology"
                class="offer-detail-tech-chip"
              >
                {{ technology }}
              </span>
            </div>
          </section>

          <section class="offer-detail-section">
            <h3>Description</h3>

            <p class="offer-detail-description">
              {{ offer.description || 'No description provided.' }}
            </p>
          </section>
        </div>

        <footer class="offer-detail-footer">
          <button
            type="button"
            class="offer-detail-secondary-button"
            @click="emit('close')"
          >
            Close
          </button>

          <button
            type="button"
            class="offer-detail-primary-button"
            :disabled="offer.isApplied"
            @click="emit('apply', offer)"
          >
            {{ offer.isApplied ? 'Applied' : 'Apply' }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  offer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'apply']);

const modalTitleId = 'feed-offer-detail-title';

const offerTechnologies = computed(() => {
  return props.offer?.technologies || [];
});
</script>

<style scoped>
.offer-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(6px);
}

.offer-detail-modal {
  width: min(48rem, 100%);
  max-height: min(88vh, 46rem);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--color-background);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.22),
    0 0 0 1px rgba(var(--color-primary-rgb), 0.06);
  overflow: hidden;
}

.offer-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.06);
  background: rgba(var(--color-background-rgb), 0.96);
}

.offer-detail-heading {
  min-width: 0;
}

.offer-detail-heading h2 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.96);
  font-size: 1.35rem;
  font-weight: var(--font-bold);
  line-height: 1.2;
}

.offer-detail-heading p {
  margin: 0.45rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-sm);
}

.offer-detail-close {
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.62);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.offer-detail-close:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.9);
}

.offer-detail-body {
  flex: 1;
  overflow-y: auto;
  display: grid;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.offer-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}

.offer-detail-info-card {
  min-height: 6.1rem;
  display: grid;
  align-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  background: rgba(var(--color-surface-rgb), 0.42);
}

.offer-detail-info-card span,
.offer-detail-section h3 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.offer-detail-info-card strong {
  color: rgba(var(--color-primary-rgb), 0.86);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.35;
}

.offer-detail-section {
  display: grid;
  gap: var(--space-sm);
}

.offer-detail-tech-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.offer-detail-tech-chip {
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-width: 100%;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0.38rem 0.78rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;

  background: rgba(var(--color-primary-rgb), 0.035);
  color: rgba(var(--color-primary-rgb), 0.68);

  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  line-height: 1.2;
  white-space: nowrap;
}

.offer-detail-description {
  margin: 0;
  max-width: 44rem;
  color: rgba(var(--color-primary-rgb), 0.64);
  font-size: var(--font-size-sm);
  line-height: 1.65;
}

.offer-detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.06);
  background: rgba(var(--color-surface-rgb), 0.35);
}

.offer-detail-secondary-button,
.offer-detail-primary-button {
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0 var(--space-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.offer-detail-secondary-button {
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: var(--color-background);
  color: rgba(var(--color-primary-rgb), 0.78);
}

.offer-detail-primary-button {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-background);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
}

.offer-detail-secondary-button:hover,
.offer-detail-primary-button:hover {
  transform: translateY(-1px);
}

.offer-detail-secondary-button:hover {
  border-color: rgba(var(--color-primary-rgb), 0.22);
  background: rgba(var(--color-primary-rgb), 0.035);
}

.offer-detail-primary-button:hover {
  background: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.22);
}

.offer-detail-primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
  transform: none;
  box-shadow: none;
}

@media (max-width: 700px) {
  .offer-detail-overlay {
    padding: var(--space-sm);
  }

  .offer-detail-modal {
    max-height: 92vh;
  }

  .offer-detail-header,
  .offer-detail-body {
    padding: var(--space-md);
  }

  .offer-detail-grid {
    grid-template-columns: 1fr;
  }

  .offer-detail-footer {
    padding: var(--space-md);
  }
}
</style>
