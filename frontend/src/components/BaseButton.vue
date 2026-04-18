<script setup>
import { computed } from 'vue';

const props = defineProps({
    type: {
        type: String,
        default: 'button',
    },
    variant: {
        type: String,
        default: 'primary',
    },
    size: {
        type: String,
        default: 'md',
    },
    block: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const classes = computed(() => [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
        'base-button--block': props.block,
    },
]);
</script>

<template>
    <button
        :type="type"
        :class="classes"
        :disabled="disabled"
    >
        <slot />
    </button>
</template>

<style scoped>

button {
    font: inherit;
    border: none;
    background: none;
}

.base-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--color-primary);
    font-weight: var(--font-medium);
    transition:
        transform var(--transition-fast),
        opacity var(--transition-fast),
        box-shadow var(--transition-fast),
        background-color var(--transition-fast),
        color var(--transition-fast);
}

.base-button:hover:not(:disabled) {
    transform: translateY(-1px);
}

.base-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(236, 108, 15, 0.18);
}

.base-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.base-button--primary {
    padding: 0.75rem 1.4rem;
    background: var(--color-primary);
    color: var(--color-background);
    box-shadow: var(--shadow-sm);
}

.base-button--primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
}

.base-button--ghost, .base-button--pill {
    padding: 0.9rem 2rem;
    border-radius: 999px;
}

.base-button--ghost {
    background: transparent;
}

.base-button--pill {
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 12px 30px rgba(67, 47, 25, 0.08);
}

.base-button--pill:hover:not(:disabled),
.base-button--ghost:hover:not(:disabled) {
    opacity: 0.9;
}

.base-button--sm {
    font-size: var(--font-size-sm);
}

.base-button--md {
    font-size: var(--font-size-md);
}

.base-button--block {
    width: 100%;
}

@media (max-width: 768px) {
    .base-button--pill {
        padding: 0.75rem 1.35rem;
    }
}
</style>
