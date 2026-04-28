<script setup>
import { computed } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const model = defineModel({
    type: [String, Number],
    default: '',
});

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'sm'
    },
});

const classes = computed(() => [
    'input',
    `input--${props.size}`,
]);
</script>

<template>
    <label :class="classes">
        <span v-if="label" class="input__label">
            {{ label }}
        </span>
        <input
            v-bind="$attrs"
            v-model="model"
        >
    </label>
</template>

<style scoped>

.input {
    display: block;
    width: 100%;
}

.input__label {
    display: block;
    margin-bottom: 0.45rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-medium);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-primary-hover);
}

input {
    display: block;
    width: 100%;
    min-height: 2.5rem;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid rgba(var(--color-primary-rgb), 0.18);
    border-radius: 0.8rem;
    background: rgba(var(--color-surface-rgb), 0.32);
    color: var(--color-primary);
    font-size: var(--font-size-md);
    line-height: 1.2;
    transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
}

.input--xs input {
    min-height: 2rem;
    padding: 0.35rem 0.65rem;
    font-size: var(--font-size-xs);
}

.input--sm input {
    min-height: 2.25rem;
    padding: 0.45rem 0.75rem;
    font-size: var(--font-size-sm);
}

.input--md input {
    min-height: 2.5rem;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-md);
}

.input--sm .input__label,
.input--xs .input__label {
    margin-bottom: 0.25rem;
}

input::placeholder {
    color: rgba(var(--color-primary-rgb), 0.42);
}

input:focus {
    outline: none;
    border-color: var(--color-secondary);
    box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}
</style>
