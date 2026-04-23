<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'pill',
    },
    size: {
        type: String,
        default: 'sm',
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
    'button',
    `button--${props.variant}`,
    `button--${props.size}`,
    {
        'button--block': props.block,
    },
]);
</script>

<template>
    <button
        :class="classes"
        :disabled="disabled"
    >
        <slot />
    </button>
</template>

<style scoped>

.button {
    font: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    color: var(--color-primary);
    font-weight: var(--font-medium);
    padding: 0.9rem 2rem;
    transition:
        transform var(--transition-fast),
        opacity var(--transition-fast),
        box-shadow var(--transition-fast),
        background-color var(--transition-fast),
        color var(--transition-fast);
}

.button:hover:not(:disabled) {
    transform: translateY(-1px);
}

.button:focus-visible {
    outline: none;
    box-shadow:
        0 0 0 3px rgba(var(--color-secondary-rgb), 0.55),
        0 0 16px rgba(var(--color-secondary-rgb), 0.55),
        0 0 34px rgba(var(--color-secondary-rgb), 0.42),
        0 0 60px rgba(var(--color-secondary-rgb), 0.28);
}

.button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.button--ghost {
    border-radius: 999px;
    background: transparent;
}

.button--pill {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 12px 30px rgba(67, 47, 25, 0.08);
}

.button--submit {
    padding: 0.78rem 1.1rem;
    border-radius: 0.8rem;
    background-color: var(--color-secondary);
    color: var(--color-background);
    box-shadow: 0 12px 24px rgba(var(--color-secondary-rgb), 0.28);
}

.button--pill:hover:not(:disabled),
.button--ghost:hover:not(:disabled) {
    opacity: 0.9;
}

.button--submit:hover:not(:disabled) {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--color-secondary) 88%, white);
}

.button--xs {
    font-size: var(--font-size-xs);
    padding: 0.5rem 0.85rem;
}

.button--sm {
    font-size: var(--font-size-sm);
    padding: 0.65rem 1rem;
}

.button--md {
    font-size: var(--font-size-md);
}

.button--block {
    width: 100%;
}

@media (max-width: 768px) {
    .button--ghost,
    .button--pill {
        padding: 0.78rem 1.35rem;
    }

    .button--pill {
        box-shadow: 0 10px 24px rgba(67, 47, 25, 0.08);
    }
}

@media (max-width: 480px) {
    .button--ghost,
    .button--pill {
        padding: 0.68rem 0.95rem;
    }

    .button--xs.button--ghost,
    .button--xs.button--pill {
        padding: 0.6rem 1rem;
    }

    .button--sm {
        font-size: var(--font-size-xs);
    }
}
</style>
