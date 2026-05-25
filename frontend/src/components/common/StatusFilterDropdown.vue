<script setup>
import { computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['update:modelValue']);

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div class="status-filter-dropdown">
    <select class="status-filter-dropdown__select" v-model="selected">
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
    <span class="status-filter-dropdown__chevron">
      <ChevronDown size="18" />
    </span>
  </div>
</template>

<style scoped>
.status-filter-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  max-width: 18rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.14);
  background: rgba(var(--color-surface-rgb), 0.88);
  box-shadow: 0 10px 30px rgba(var(--color-primary-rgb), 0.04);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.status-filter-dropdown:hover,
.status-filter-dropdown:focus-within {
  border-color: rgba(var(--color-secondary-rgb), 0.35);
  box-shadow: 0 10px 30px rgba(var(--color-primary-rgb), 0.08);
}

.status-filter-dropdown__select {
  flex: 1;
  min-width: 0;
  padding: 0.75rem 0.95rem 0.75rem 0.95rem;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.status-filter-dropdown__select:hover,
.status-filter-dropdown__select:focus {
  color: var(--color-secondary);
}

.status-filter-dropdown__select option {
  color: var(--color-primary);
  background: var(--color-background);
}

.status-filter-dropdown__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  padding-right: 0.75rem;
  pointer-events: none;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .status-filter-dropdown {
    max-width: 100%;
    width: 100%;
  }

  .status-filter-dropdown__select {
    font-size: var(--font-size-xs);
    padding: 0.65rem 0.8rem 0.65rem 0.8rem;
  }

  .status-filter-dropdown__chevron {
    padding-right: 0.55rem;
  }
}
</style>
