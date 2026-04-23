<template>
    <div class="error">
        <span class="error__icon">⚠</span>
        <p>
            <slot />
        </p>
    </div>
</template>

<style scoped>
.error {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.08rem 0.9rem;
    margin: 1.2rem 0 0;
    border: none;
    color: var(--color-error);
    font-size: var(--font-size-sm);
    line-height: 1.4;
    text-shadow:
        0 0 8px rgba(var(--color-error-rgb), 0.75),
        0 0 16px rgba(var(--color-error-rgb), 0.55),
        0 0 28px rgba(var(--color-error-rgb), 0.4);
}
.error__icon {
    flex-shrink: 0;
    font-size: 0.95rem;
    line-height: 1.2;
    opacity: 0.9;
}
</style>