<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 4,
  },
});

const meterStyle = computed(() => {
  const completionPercentage = (props.value * 100) / props.max;
  let backgroundColor;

  if (completionPercentage <= 25) backgroundColor = 'var(--color-error)';
  else if (completionPercentage <= 50) backgroundColor = '#e07012';
  else if (completionPercentage <= 75) backgroundColor = '#d9b20b';
  else backgroundColor = 'var(--color-success)';

  return {
    width: `${completionPercentage}%`,
    backgroundColor,
  };
});
</script>

<template>
  <div class="progress-meter__bar">
    <div
      class="progress-meter__fill"
      :style="meterStyle"
    />
  </div>
</template>

<style scoped>
.progress-meter__bar {
  flex: 1;
  min-width: 4rem;
  overflow: hidden;
  height: 0.38rem;
  border-radius: 999px;
  background-color: rgba(var(--color-primary-rgb), 0.12);
}

.progress-meter__fill {
  height: 100%;
  border-radius: inherit;
  background-color: var(--color-success);
  transition:
    width 0.48s var(--ease-overshoot),
    background-color var(--transition-normal);
}
</style>
