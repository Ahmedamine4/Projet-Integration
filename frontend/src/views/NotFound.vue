<template>
    <section class="not-found">
        <h1>404</h1>
        <p>Page not found</p>
        <RouterLink to="/">Go home</RouterLink>
    </section>
</template>
<style scoped>
.not-found {
    text-align: center;
    padding: var(--space-xl) var(--space-md);
}
h1 {
    font-size: var(--font-size-xl);
    color: var(--color-error);
    margin-bottom: var(--space-sm);
}

p {
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-md);
}

a {
    color: var(--color-secondary);
    font-weight: var(--font-medium);
    text-decoration: none;
}

a:hover,
a:focus-visible {
    text-decoration: underline;
    outline: none;
}
</style>