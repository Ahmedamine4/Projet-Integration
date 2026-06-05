<template>
  <div
    v-if="offer"
    class="offer-backdrop"
    @click.self="emit('close')"
  >
    <article class="offer-modal">
      <header class="offer-modal-header">
        <div>
          <span class="offer-type">{{ offer.type }}</span>
          <h2>{{ offer.title }}</h2>
          <p>{{ offer.company }} · {{ offer.location }}</p>
        </div>

        <button
          type="button"
          class="close-button"
          aria-label="Close"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <section class="offer-section">
        <h3>Description</h3>
        <p>{{ offer.description }}</p>
      </section>

      <section class="offer-section">
        <h3>Required technologies</h3>

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
        <h3>Details</h3>

        <ul>
          <li>Contract: {{ offer.type }}</li>
          <li>Duration: {{ offer.duration }}</li>
          <li>Experience level: {{ offer.level }}</li>
        </ul>
      </section>

      <footer class="offer-actions">
        <button
          type="button"
          class="secondary-button"
          @click="emit('close')"
        >
          Close
        </button>

        <button
          type="button"
          class="primary-button"
        >
          Apply
        </button>
      </footer>
    </article>
  </div>
</template>

<script setup>
defineProps({
  offer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);
</script>

<style scoped>
.offer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: grid;
  place-items: center;
  padding: var(--space-lg);
  background: rgba(var(--color-primary-rgb), 0.32);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.offer-modal {
  width: min(100%, 34rem);
  max-height: min(90vh, 42rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: rgba(var(--color-surface-rgb), 0.98);
  box-shadow: 0 24px 60px rgba(var(--color-primary-rgb), 0.22);
}

.offer-modal-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
}

.offer-type {
  display: inline-flex;
  width: fit-content;
  margin-bottom: var(--space-xs);
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.24);
  background: rgba(var(--color-secondary-rgb), 0.09);
  color: rgba(var(--color-secondary-rgb), 0.95);
  font-size: 10px;
  font-weight: var(--font-bold);
}

.offer-modal-header h2 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.95);
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
}

.offer-modal-header p {
  margin: var(--space-xs) 0 0;
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xs);
}

.close-button {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: var(--font-size-md);
  cursor: pointer;
}

.offer-section {
  display: grid;
  gap: var(--space-xs);
}

.offer-section h3 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.82);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.offer-section p,
.offer-section li {
  color: rgba(var(--color-primary-rgb), 0.66);
  font-size: var(--font-size-xs);
  line-height: 1.55;
}

.offer-section p {
  margin: 0;
}

.offer-section ul {
  margin: 0;
  padding-left: var(--space-md);
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-list span {
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  background: rgba(var(--color-background-rgb), 0.55);
  color: rgba(var(--color-primary-rgb), 0.6);
  font-size: 10px;
  font-weight: var(--font-medium);
}

.offer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
}

.primary-button,
.secondary-button {
  height: 2.25rem;
  padding: 0 var(--space-md);
  border-radius: 999px;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  cursor: pointer;
}

.primary-button {
  border: 1px solid rgba(var(--color-secondary-rgb), 0.38);
  background: rgba(var(--color-secondary-rgb), 0.16);
  color: rgba(var(--color-secondary-rgb), 0.98);
}

.secondary-button {
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.62);
}
</style>