<script setup>
import { ArrowUpRight } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  experienceType: {
    type: String,
    required: true,
  },
  experienceId: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
});

const route = useRoute();
const router = useRouter();

const buttonLabel = computed(() => {
  return props.label || `Explore ${props.experienceType}`;
});

const experienceRoute = computed(() => {
  if (route.params.id) {
    return {
      name: 'portfolio-experience',
      params: {
        id: route.params.id,
        experienceId: props.experienceId,
      },
    };
  }

  return {
    name: 'my-portfolio-experience',
    params: {
      experienceId: props.experienceId,
    },
  };
});

function openExperience() {
  router.push(experienceRoute.value);
}
</script>

<template>
  <button
    type="button"
    class="explore-button"
    @click.stop="openExperience"
  >
    <span class="explore-button-label-track">
      <span class="explore-button-label">
        {{ buttonLabel }}
      </span>
    </span>

    <span class="explore-button-icon">
      <ArrowUpRight :size="14" />
    </span>
  </button>
</template>

<style scoped>
.explore-button {
  --button-size: 2rem;
  --icon-size: 14px;
  --edge-space: calc((var(--button-size) - var(--icon-size)) / 2);
  --expanded-right-space: calc((var(--button-size) - 1em) / 2);
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
  min-width: var(--button-size);
  height: var(--button-size);
  padding-inline: var(--edge-space);
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.14);
  background-color: rgba(var(--color-secondary-rgb), 0.08);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  line-height: 1;
  cursor: pointer;
  transition:
    gap var(--transition-fast),
    padding-inline var(--transition-fast),
    border-color var(--transition-fast),
    background-color var(--transition-fast);
}

.explore-button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  flex-shrink: 0;
  color: currentColor;
}

.explore-button-label-track {
  display: grid;
  grid-template-columns: 0fr;
  overflow: hidden;
  transition: grid-template-columns var(--transition-normal);
}

.explore-button-label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.explore-button-icon svg {
  display: block;
}

.explore-button:is(:hover, :focus-visible) {
  gap: var(--edge-space);
  padding-inline: var(--space-md) var(--expanded-right-space);
  outline: none;
  border-color: rgba(var(--color-secondary-rgb), 0.16);
  background-color: rgba(var(--color-secondary-rgb), 0.14);
}

.explore-button:is(:hover, :focus-visible) .explore-button-label-track {
  grid-template-columns: 1fr;
}

.explore-button:is(:hover, :focus-visible) .explore-button-label {
  opacity: 1;
}
</style>
