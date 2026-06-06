<script setup>
import { CalendarDays, Eye, EyeOff, Quote } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps({
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

const dateLabel = computed(() => {
  if (!props.recommendation.date) return '';

  const date = new Date(props.recommendation.date);
  if (Number.isNaN(date.getTime())) return props.recommendation.date;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
});
</script>

<template>
  <article
    class="recommendation-card"
    :class="{ 'recommendation-card--hidden': !isVisible }"
  >
    <header>
      <span class="recommendation-card__quote">
        <Quote :size="15" />
      </span>
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
    <footer v-if="dateLabel">
      <CalendarDays :size="13" />
      <time :datetime="recommendation.date">{{ dateLabel }}</time>
    </footer>
  </article>
</template>

<style scoped>
.recommendation-card {
  position: relative;
  flex: 0 0 clamp(18rem, 30vw, 24rem);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-md);
  height: clamp(16rem, 28vw, 19rem);
  padding: var(--space-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.11);
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      135deg,
      rgba(var(--color-secondary-rgb), 0.13),
      transparent 42%
    ),
    linear-gradient(
      180deg,
      rgba(var(--color-surface-rgb), 0.66),
      rgba(var(--color-background-rgb), 0.9)
    );
  box-shadow: 0 0.9rem 1.9rem rgba(0, 0, 0, 0.07);
  overflow: hidden;
  user-select: none;
  transition:
    opacity var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.recommendation-card:hover {
  border-color: rgba(var(--color-primary-rgb), 0.16);
  box-shadow: 0 1rem 2.2rem rgba(0, 0, 0, 0.095);
  transform: translateY(-1px);
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
  gap: var(--space-sm);
  min-width: 0;
  min-height: 2.25rem;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.recommendation-card__quote {
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-secondary);
}

.recommendation-card__author {
  flex: 1 1 auto;
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
  background-color: transparent;
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
  overflow-y: auto;
  padding-right: var(--space-sm);
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary-rgb), 0.2) transparent;
}

.recommendation-card p::-webkit-scrollbar {
  width: 0.32rem;
}

.recommendation-card p::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.22);
}

.recommendation-card footer {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  width: fit-content;
  min-height: 1.7rem;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.045);
  color: rgba(var(--color-primary-rgb), 0.58);
  font-family: var(--font-mono);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .recommendation-card {
    padding: var(--space-lg);
    flex-basis: min(82vw, 22rem);
    height: 17rem;
  }
}
</style>
