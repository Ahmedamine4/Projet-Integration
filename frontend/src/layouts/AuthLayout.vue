<template>
    <div class="auth-shell">
        <aside class="auth-visual"></aside>
        <section class="auth-panel">
            <slot />
        </section>
    </div>
</template>

<style scoped>
.auth-shell {
    width: 100%;
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(20rem, 1fr) minmax(30rem, 1fr);
    background: rgba(var(--color-background-rgb), 0.9);
}
.auth-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: clamp(0.9rem, 2vw, 1.5rem);
    background:
        linear-gradient(165deg, rgba(var(--color-secondary-rgb), 0.34), transparent 45%),
        linear-gradient(180deg, rgba(var(--color-background-rgb), 0.95), var(--color-surface));
}

.auth-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
    padding-block: clamp(1.25rem, 3vw, 2.5rem);
    padding-inline: clamp(1.25rem, 4vw, 3rem);
    background: var(--color-background);
}

@media (max-width: 980px) {
    .auth-shell {
        grid-template-columns: 1fr;
    }
    .auth-visual {
        display: none;
    }
}
</style>