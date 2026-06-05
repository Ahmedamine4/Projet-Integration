<script setup>
import { Eye, EyeOff } from 'lucide-vue-next';

defineProps({
  recommendation: {
    type: Object,
    required: true,
  },
  canManageVisibility: {
    type: Boolean,
    default: false,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['toggle-visibility']);
</script>

<template>
  <article
    class="recommendation-card"
    :class="{ 'recommendation-card--hidden': !isVisible }"
  >
    <header>
      <div class="recommendation-card__author">
        <span>{{ recommendation.authorName }}</span>
        <small>{{ recommendation.authorRole }}</small>
      </div>

      <button
        v-if="canManageVisibility"
        type="button"
        class="recommendation-card__visibility"
        :aria-pressed="isVisible"
        :aria-label="isVisible ? 'Hide recommendation from public' : 'Show recommendation to public'"
        @pointerdown.stop
        @click.stop="emit('toggle-visibility')"
      >
        <Eye
          v-if="isVisible"
          :size="17"
        />
        <EyeOff
          v-else
          :size="17"
        />
      </button>
    </header>
    <p>{{ recommendation.content }}</p>
  </article>
</template>

<style scoped>
.recommendation-card {
  position: relative;
  flex: 0 0 clamp(18rem, 30vw, 24rem);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: var(--space-lg);
  min-height: 13rem;
  padding: calc(var(--space-xl) * 1.05);
  padding-top: var(--space-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      180deg,
      rgba(var(--color-surface-rgb), 0.52),
      rgba(var(--color-background-rgb), 0.84)
    );
  overflow: hidden;
  user-select: none;
}

.recommendation-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.28rem;
  background: var(--color-secondary);
}

.recommendation-card--hidden {
  opacity: 0.58;
}

.recommendation-card header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  min-width: 0;
  min-height: 2.35rem;
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.recommendation-card__author {
  min-width: 0;
  display: grid;
  gap: 0.2rem;
}

.recommendation-card span {
  overflow-wrap: anywhere;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.25;
}

.recommendation-card small {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1.35;
}

.recommendation-card__visibility {
  display: inline-grid;
  flex: 0 0 auto;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border: none;
  border-radius: var(--radius-sm);
  color: rgba(var(--color-primary-rgb), 0.72);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.recommendation-card__visibility:hover {
  background: rgba(var(--color-primary-rgb), 0.02);
  color: var(--color-primary);
}

.recommendation-card p {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.78);
  font-size: var(--font-size-sm);
  line-height: 1.72;
}

@media (max-width: 640px) {
  .recommendation-card {
    padding: var(--space-lg);
    flex-basis: min(82vw, 22rem);
    gap: var(--space-md);
  }
}
</style>
