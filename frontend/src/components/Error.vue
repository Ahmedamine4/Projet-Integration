<template>
    <p class="auth-error">
        <slot />
    </p>
</template>

<style scoped>
.auth-error {
    margin: 0.5rem auto 0.4rem;
    font-size: var(--font-size-sm);
    color: var(--color-error);
}
</style>