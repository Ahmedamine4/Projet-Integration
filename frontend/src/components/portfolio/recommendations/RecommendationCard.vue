<script setup>
import { CalendarDays, ChevronDown, ChevronUp, Eye, EyeOff, Quote } from 'lucide-vue-next';
import { computed, ref } from 'vue';

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
const TRUNCATE_LEN = 250;
const isExpanded = ref(false);

const dateLabel = computed(() => {
  if (!props.recommendation.date) return '';

  const date = new Date(props.recommendation.date);
  if (Number.isNaN(date.getTime())) return props.recommendation.date;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
});

const isTruncated = computed(() => props.recommendation.content.length > TRUNCATE_LEN);

const displayedContent = computed(() => {
  if (!props.recommendation.content) return '';

  if (isExpanded.value || !isTruncated.value) {
    return props.recommendation.content;
  }

  return `${props.recommendation.content.slice(0, TRUNCATE_LEN).trim()}...`;
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

      <div class="recommendation-card__meta">
        <span
          v-if="dateLabel"
          class="recommendation-card__date"
        >
          <CalendarDays :size="13" />
          <time :datetime="recommendation.date">{{ dateLabel }}</time>
        </span>

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
      </div>
    </header>
    <div class="recommendation-card__content">
      <p>{{ displayedContent }}</p>

      <button
        v-if="isTruncated"
        type="button"
        class="recommendation-card__toggle"
        @pointerdown.stop
        @click.stop="isExpanded = !isExpanded"
      >
        <span>{{ isExpanded ? 'See less' : 'See more' }}</span>
        <ChevronUp
          v-if="isExpanded"
          :size="15"
        />
        <ChevronDown
          v-else
          :size="15"
        />
      </button>
    </div>

  </article>
</template>

<style scoped>
.recommendation-card {
  position: relative;
  flex: 0 0 clamp(22rem, 38vw, 31rem);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--space-md);
  min-height: clamp(13rem, 22vw, 15.5rem);
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
    filter var(--transition-fast),
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
  background:
    linear-gradient(
      135deg,
      rgba(var(--color-primary-rgb), 0.08),
      transparent 38%
    ),
    rgba(var(--color-surface-rgb), 0.34);
}

.recommendation-card--hidden::before {
  background: rgba(var(--color-primary-rgb), 0.18);
}

.recommendation-card--hidden .recommendation-card__quote,
.recommendation-card--hidden .recommendation-card__author,
.recommendation-card--hidden .recommendation-card__date,
.recommendation-card--hidden .recommendation-card__content > p {
  filter: grayscale(1) saturate(0);
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

.recommendation-card__author span {
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

.recommendation-card__meta {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.recommendation-card__date,
.recommendation-card__visibility {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.recommendation-card__date {
  gap: 0.35rem;
  width: fit-content;
  padding: 0.4rem 0.64rem;
  border-radius: 999px;
  background-color: rgba(var(--color-primary-rgb), 0.055);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-family: var(--font-mono);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
  white-space: nowrap;
}

.recommendation-card__visibility {
  display: inline-grid;
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

.recommendation-card__content {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: var(--space-sm);
}

.recommendation-card p {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.78);
  font-size: var(--font-size-sm);
  line-height: 1.58;
  overflow-wrap: anywhere;
}

.recommendation-card__toggle {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: var(--space-xs);
  border: none;
  padding: 0;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.68);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
}

.recommendation-card__toggle:hover {
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .recommendation-card {
    padding: var(--space-lg);
    flex-basis: min(88vw, 26rem);
    min-height: 15rem;
  }
}
</style>
