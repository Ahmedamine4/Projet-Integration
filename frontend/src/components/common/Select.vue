<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

defineOptions({
  inheritAttrs: false,
});

const model = defineModel({
  type: String,
  default: '',
});

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
});

const isOpen = ref(false);
const selectElement = ref(null);

const displayValue = computed(() => model.value || props.placeholder);

function selectOption(option) {
  model.value = option;
  isOpen.value = false;
}

function closeOnOutsideClick(event) {
  if (!selectElement.value?.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
});
</script>

<template>
  <div ref="selectElement" class="select">
    <span v-if="label" class="select__label">
      {{ label }}
    </span>

    <button
      v-bind="$attrs"
      class="select__control"
      type="button"
      :class="{ 'select__control--placeholder': !model }"
      @click="isOpen = !isOpen"
    >
      <span class="select__value">{{ displayValue }}</span>
      <ChevronDown class="select__icon" :size="16" />
    </button>
    <Transition name="popover">
      <div v-if="isOpen" class="select__list">
        <button
          v-for="option in options"
          :key="option"
          class="select__option"
          type="button"
          :class="{ 'select__option--selected': option === model }"
          @click="selectOption(option)"
        >
          {{ option }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.select {
  position: relative;
  width: 100%;
  min-width: 0;
}

.select__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary-hover);
  cursor: pointer;
}

.select__control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 2.25rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 0.8rem;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.select__value {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select__control--placeholder {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.select__control:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.select__icon {
  flex: 0 0 auto;
  color: rgba(var(--color-primary-rgb), 0.5);
}

.select__list {
  position: absolute;
  z-index: 100;
  top: calc(100% + var(--space-sm));
  left: 0;
  right: 0;
  display: grid;
  max-width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: var(--radius-md);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.select__option {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 2.5rem;
  padding: 0.65rem 0.75rem;
  border: 0;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.25;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.select__option:last-child {
  border-bottom: 0;
}

.select__option:hover,
.select__option--selected {
  background: rgba(var(--color-surface-rgb), 0.55);
}

.popover-enter-active,
.popover-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}
</style>

