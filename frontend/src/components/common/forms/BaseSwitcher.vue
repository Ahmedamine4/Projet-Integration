<script setup>
import { computed } from 'vue';

const model = defineModel({
  type: String,
  required: true,
});

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
});

const activeIndex = computed(() =>
  props.options.findIndex((option) => option.value === model.value),
);

const thumbStyle = computed(() => {
  return {
    '--active-index': activeIndex.value >= 0 ? activeIndex.value : 0,
    '--option-count': props.options.length || 1,
  };
});
</script>

<template>
  <div class="switcher">
    <span
      class="switcher__thumb"
      :style="thumbStyle"
    />

    <template
      v-for="option in options"
      :key="option.value"
    >
      <input
        :id="`switcher-${option.value}`"
        v-model="model"
        :value="option.value"
        type="radio"
      >
      <label
        :for="`switcher-${option.value}`"
        :class="{ selected: model === option.value }"
      >
        {{ option.label }}
      </label>
    </template>
  </div>
</template>

<style scoped>
.switcher {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 2.625rem;
  margin: 0;
  padding: var(--space-xs);
  border: none;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.05);
  gap: var(--space-xs);
  isolation: isolate;
}

.switcher input {
  display: none;
}

.switcher__thumb {
  --switcher__thumb-width: calc(
    (100% - 2 * var(--space-xs) - (var(--option-count) - 1) * var(--space-xs)) /
      var(--option-count)
  );
  position: absolute;
  top: 0.2rem;
  bottom: 0.2rem;
  left: calc(
    var(--space-xs) + var(--active-index) *
      (var(--switcher__thumb-width) + var(--space-xs))
  );
  width: var(--switcher__thumb-width);
  border-radius: 999px;
  background-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transition:
    left 0.35s var(--ease-overshoot),
    width 0.35s ease,
    background-color var(--transition-fast);
  will-change: left;
  z-index: 0;
}

.switcher label {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  flex: 1;
  cursor: pointer;
  min-width: 0;
  padding: 0 var(--space-md);
  border-radius: 999px;
  text-align: center;
  font-size: var(--font-size-xs);
  line-height: 1.2;
  color: var(--color-primary);
  user-select: none;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition:
    color var(--transition-normal),
    transform var(--transition-fast);
}

.switcher label:hover {
  transform: translateY(-1px);
}

.switcher label:active {
  transform: translateY(0);
}

.switcher label.selected {
  color: var(--color-background);
  font-weight: var(--font-bold);
}
</style>
