<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import BaseInput from '@/components/common/forms/BaseInput.vue';

defineOptions({
  inheritAttrs: false,
});

const model = defineModel({
  type: String,
  default: '',
});

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  visibleOptions: {
    type: Number,
    default: 4,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const isOpen = ref(false);

const dropdownElement = ref(null);

const filteredOptions = computed(() => {
  const search = model.value.trim().toLowerCase();
  if (!search) return props.options;

  return props.options.filter((option) => {
    return option.toLowerCase().includes(search);
  });
});

const shouldShowOptions = computed(() => {
  return !props.disabled && isOpen.value && filteredOptions.value.length > 0;
});

function selectOption(option) {
  if (props.disabled) return;

  model.value = option;
  isOpen.value = false;
}

function closeOnOutsideClick(event) {
  if (!dropdownElement.value?.contains(event.target)) isOpen.value = false;
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
});
</script>

<template>
  <div
    ref="dropdownElement"
    class="dropdown"
  >
    <BaseInput
      v-model="model"
      v-bind="$attrs"
      :label
      :placeholder
      :disabled="disabled"
      @focus="isOpen = !disabled && options.length > 0"
    />
    <Transition name="popover">
      <div
        v-if="shouldShowOptions"
        class="dropdown__list"
        :style="{ '--visible-options': visibleOptions }"
      >
        <button
          v-for="option in filteredOptions"
          :key="option"
          class="dropdown__option"
          type="button"
          @click="selectOption(option)"
        >
          {{ option }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown__list {
  position: absolute;
  z-index: 100;
  top: calc(100% + var(--space-sm));
  left: 0;
  right: 0;
  display: grid;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: var(--radius-md);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
  max-height: calc(2.5rem * var(--visible-options));
  overflow: auto;
}

.dropdown__option {
  width: 100%;
  min-height: 2.5rem;
  padding: 0.65rem 0.75rem;
  border: 0;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--font-size-sm);
  text-align: left;
  cursor: pointer;
}

.dropdown__option:last-child {
  border-bottom: 0;
}

.dropdown__option:hover {
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
