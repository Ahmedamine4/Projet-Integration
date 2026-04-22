<script setup>
defineProps({
    block: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
});
</script>

<template>
    <button
        type="submit"
        :class="[
            'submit-button',
            {'submit-button--block': block},
        ]"
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

.submit-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.78rem 1.1rem;
    border: none;
    border-radius: 0.8rem;
    cursor: pointer;
    background-color: var(--color-secondary);
    color: var(--color-background);
    font-weight: var(--font-medium);
    box-shadow: 0 12px 24px rgba(var(--color-secondary-rgb), 0.28);
    transition:
        transform var(--transition-fast),
        opacity var(--transition-fast),
        box-shadow var(--transition-fast),
        background-color var(--transition-fast);
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--color-secondary) 88%, white);
}

.submit-button:focus-visible {
    outline: none;
    box-shadow:
        0 0 0 3px rgba(var(--color-secondary-rgb)),
        0 12px 24px rgba(var(--color-secondary-rgb), 0.28);
}
.submit-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.submit-button--block {
    width: 100%;
}
</style>
