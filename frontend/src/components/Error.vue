<template>
    <div class="error">
        <p><slot /></p>
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
}
</style>