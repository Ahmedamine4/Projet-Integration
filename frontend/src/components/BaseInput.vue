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
.base-input {
    display: block;
    width: 100%;
    margin-bottom: var(--space-md);
}

.base-input__label {
    display: block;
    margin-bottom: var(--space-xs);
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
    color: var(--color-primary);
}

.base-input input {
    margin-bottom: 0;
}
</style>
