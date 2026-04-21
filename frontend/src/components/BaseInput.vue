<script setup>
import { computed, useAttrs } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    modelValue: {
        type: [String, Number],
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);
const attrs = useAttrs();
const inputId = computed(() => attrs.id ?? `base-input-${props.label.toLowerCase().replace(/\s+/g, '-') || 'field'}`);

const updateValue = (event) => {
    emit('update:modelValue', event.target.value);
};
</script>

<template>
    <label class="base-input">
        <span v-if="label" class="base-input__label">{{ label }}</span>
        <input
            v-bind="$attrs"
            :id="inputId"
            :value="modelValue"
            @input="updateValue"
        >
    </label>
</template>

<style scoped>

input {
    display: block;
    width: 100%;
    min-height: 2.5rem;
    margin-bottom: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid rgba(var(--color-primary-rgb), 0.18);
    border-radius: 0.8rem;
    background: rgba(var(--color-background-rgb), 0.78);
    color: var(--color-primary);
    line-height: 1.2;
    transition: border-color var(--transition-fast),
        box-shadow var(--transition-fast);
}

input::placeholder {
    color: rgba(var(--color-primary-rgb), 0.42);
}

input:focus {
    outline: none;
    border-color: var(--color-secondary);
    box-shadow: 0 0 0 3px rgba(236, 108, 15, 0.15);
}

.base-input {
    display: block;
    width: 100%;
    margin-bottom: var(--space-md);
}

.base-input__label {
    display: block;
    margin-bottom: 0.45rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-medium);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-primary-hover);
}

.base-input input {
    margin-bottom: 0;
}
</style>
