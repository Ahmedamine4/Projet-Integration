<script setup>
import { computed, getCurrentInstance } from 'vue';
import { Minus, Plus } from 'lucide-vue-next';

const model = defineModel({
  type: Number,
  default: null,
});

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  min: {
    type: Number,
    default: 1980,
  },
  max: {
    type: Number,
    default: null,
  },
  placeholder: {
    type: String,
    default: 'YYYY',
  },
});

const instance = getCurrentInstance();
const inputId = `year-input-${instance.uid}`;

const yearText = computed(() => String(model.value ?? ''));
const isCompleteYear = computed(() => /^\d{4}$/.test(yearText.value));

const minYear = computed(() => props.min ?? 1980);
const maxYear = computed(() => props.max);

const canDecrease = computed(() => {
  return isCompleteYear.value && model.value > minYear.value;
});

const canIncrease = computed(() => {
  return (
    isCompleteYear.value &&
    (maxYear.value === null || model.value < maxYear.value)
  );
});

function blockNonDigitInput(event) {
  if (event.data && /\D/.test(event.data)) {
    event.preventDefault();
  }
}

function updateYear(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 4);
  model.value = digits ? Number(digits) : null;
}

function decreaseYear() {
  if (!canDecrease.value) return;
  model.value -= 1;
}

function increaseYear() {
  if (!canIncrease.value) return;
  model.value += 1;
}
</script>

<template>
  <div class="year-input">
    <label
      v-if="label"
      class="year-input__label"
      :for="inputId"
    >
      {{ label }}
    </label>

    <div class="year-input__control">
      <button
        class="year-input__button"
        type="button"
        :disabled="!canDecrease"
        @click="decreaseYear"
      >
        <Minus />
      </button>

      <input
        :id="inputId"
        :value="model ?? ''"
        class="year-input__field"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="4"
        :placeholder="placeholder"
        @beforeinput="blockNonDigitInput"
        @input="updateYear($event.target.value)"
      >

      <button
        class="year-input__button"
        type="button"
        :disabled="!canIncrease"
        @click="increaseYear"
      >
        <Plus />
      </button>
    </div>
  </div>
</template>

<style scoped>
.year-input {
  width: 100%;
}

.year-input__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary-hover);
}

.year-input__control {
  display: grid;
  grid-template-columns: 1.65rem minmax(0, 1fr) 1.65rem;
  align-items: center;
  min-height: 2.25rem;
  column-gap: 0.5rem;
  padding: 0.125rem 0.5rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.16);
  border-radius: 0.8rem;
  background: rgba(var(--color-surface-rgb), 0.32);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.year-input__control:focus-within {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.year-input__field {
  width: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  line-height: 1;
  text-align: center;
  letter-spacing: 0.12em;
}

.year-input__field:focus {
  outline: none;
}

.year-input__field::placeholder {
  color: rgba(var(--color-primary-rgb), 0.36);
}

.year-input__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  padding: 0;
  border: 0;
  border-radius: calc(var(--radius-md) - 0.25rem);
  background: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.72);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.year-input__button:hover:not(:disabled) {
  background: rgba(var(--color-secondary-rgb), 0.14);
  color: var(--color-secondary);
  transform: translateY(-1px);
}

.year-input__button:active:not(:disabled) {
  transform: translate(0);
}

.year-input__button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.year-input__button svg {
  width: 1rem;
  height: 1rem;
}
</style>
