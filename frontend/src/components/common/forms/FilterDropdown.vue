<script setup>
import { ref, computed, onMounted, onBeforeUnmount, useAttrs } from 'vue';
import Input from '@/components/common/forms/BaseInput.vue';
import { Filter } from 'lucide-vue-next';

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
});

const isOpen = ref(false);
const dropdownElement = ref(null);

const filteredOptions = computed(() => {
  const search = (model.value || '').trim().toLowerCase();
  
  if (!search || props.options.some(opt => opt.toLowerCase() === search)) {
    return props.options;
  }

  return props.options.filter((option) => {
    return option.toLowerCase().includes(search);
  });
});

const shouldShowOptions = computed(() => {
  return isOpen.value && filteredOptions.value.length > 0;
});

function selectOption(option) {
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
  <div ref="dropdownElement" class="dropdown" :class="{ 'dropdown--open': isOpen }">
    <Input
      v-model="model"
      v-bind="$attrs"
      :label="label"
      :placeholder="placeholder"
      @click="isOpen = !isOpen"
    />

    <Filter class="dropdown__filter-icon" :size="16" />
    
    <svg class="dropdown__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>

    <Transition name="popover">
      <div
        class="dropdown__list"
        v-if="shouldShowOptions"
        :style="{ '--visible-options': visibleOptions }"
      >
        <button
          class="dropdown__option"
          v-for="option in filteredOptions"
          :key="option"
          type="button"
          @click="selectOption(option)"
          :class="{ 'dropdown__option--active': option === model }"
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

.dropdown__chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(var(--color-primary-rgb), 0.5);
  transition: transform var(--transition-fast);
}


.dropdown--open .dropdown__chevron {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown__filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(var(--color-primary-rgb), 0.4);
}

:deep(input[readonly]) {
  cursor: pointer !important;
  padding-left: 2.2rem !important;
  padding-right: 2.5rem; 
  pointer-events: none !important;
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
  transition: background var(--transition-fast);
}

.dropdown__option:last-child {
  border-bottom: 0;
}

.dropdown__option:hover {
  background: rgba(var(--color-surface-rgb), 0.55);
}

.dropdown__option--active {
  background: rgba(var(--color-secondary-rgb), 0.08);
  color: var(--color-secondary);
  font-weight: var(--font-medium);
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