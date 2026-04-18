<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    options: {
        type: Array,
        required: true,
    },
    name: {
        type: String,
        default: 'base-switcher',
    },
});

const emit = defineEmits(['update:modelValue']);

const selectOption = (value) => {
    emit('update:modelValue', value);
};

const activeIndex = computed(() => props.options.findIndex((option) => option.value === props.modelValue));
const thumbStyle = computed(() => {
    return {
        '--active-index': activeIndex.value >= 0 ? activeIndex.value : 0,
        '--option-count': props.options.length || 1,
    };
});
</script>

<template>
    <div class="base-switcher">
        <span class="base-switcher__thumb" :style="thumbStyle" aria-hidden="true" />
        <template v-for="option in options" :key="option.value">
            <input
                :id="`${name}-${option.value}`"
                :checked="modelValue === option.value"
                :name="name"
                :value="option.value"
                type="radio"
                @change="selectOption(option.value)"
            >
            <label
                :for="`${name}-${option.value}`"
                :class="{ selected: modelValue === option.value }"
            >
                {{ option.label }}
            </label>
        </template>
    </div>
</template>

<style scoped>
.base-switcher {
    position: relative;
    display: flex;
    width: 100%;
    margin: 0 0 var(--space-md);
    padding: var(--space-xs);
    border: 1px solid var(--color-primary-hover);
    border-radius: var(--radius-sm);
    background-color: var(--color-background);
    gap: var(--space-xs);
    isolation: isolate;
}

.base-switcher input {
    display: none;
}

.base-switcher__thumb {
    position: absolute;
    top: 0.12rem;
    bottom: 0.12rem;
    left: calc(
        var(--space-xs) +
        var(--active-index) * (
            ((100% - (2 * var(--space-xs)) - ((var(--option-count) - 1) * var(--space-xs))) / var(--option-count)) +
            var(--space-xs)
        )
    );
    width: calc(
        (100% - (2 * var(--space-xs)) - ((var(--option-count) - 1) * var(--space-xs))) / var(--option-count)
    );
    border-radius: var(--radius-sm);
    background-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    transition: left var(--transition-normal),
        width var(--transition-normal),
        background-color var(--transition-fast);
    will-change: left;
    z-index: 0;
}

.base-switcher label {
    position: relative;
    z-index: 1;
    flex: 1;
    cursor: pointer;
    min-width: 0;
    padding: clamp(0.35rem, 1.6vw, 0.55rem) clamp(0.35rem, 2vw, var(--space-md));
    border-radius: var(--radius-sm);
    text-align: center;
    font-size: clamp(0.68rem, 1.9vw, var(--font-size-sm));
    line-height: 1.2;
    color: var(--color-primary);
    user-select: none;
    white-space: nowrap;
    transition: color var(--transition-normal),
        transform var(--transition-fast);
}

.base-switcher label:hover {
    transform: translateY(-1px);
}

.base-switcher label:active {
    transform: translateY(0);
}

.base-switcher label.selected {
    color: var(--color-background);
    font-weight: var(--font-bold);
}
</style>
