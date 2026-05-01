<template>
    <div class="divider">
        <span><slot /></span>
    </div>
</template>

<style scoped>
.divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-primary-hover);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(var(--color-primary-rgb), 0.18);
}
</style>