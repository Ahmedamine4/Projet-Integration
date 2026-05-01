<script setup>
import { useRouter } from 'vue-router';
import Button from '@/components/common/Button.vue';

const router = useRouter();
</script>

<template>
    <section class="not-found">
        <p class="not-found__code">404</p>
        <h1>Unverified page</h1>
        <p class="not-found__message">
            This page does not have a certified place in your portfolio.
        </p>
        <div class="not-found__actions">
            <Button
                variant="pill"
                size="xs"
                @click="router.push('/')"
            >
                Back home
            </Button>
            <Button
                variant="ghost"
                size="xs"
                @click="router.push('/login')"
            >
                Sign in
            </Button>
        </div>
    </section>
</template>

<style scoped>
.not-found {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: var(--space-xl) var(--space-md);
    background:
        linear-gradient(225deg, rgba(var(--color-secondary-rgb), 0.22), transparent 38%),
        linear-gradient(140deg, rgba(var(--color-primary-rgb), 0.05), transparent 42%),
        linear-gradient(200deg, var(--color-background), var(--color-background) 48%, var(--color-surface) 100%);
    color: var(--color-primary);
}

.not-found__code {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(3.8rem, 12vw, 7.5rem);
    font-weight: var(--font-bold);
    line-height: 0.9;
    color: var(--color-secondary);
}

.not-found h1 {
    margin: var(--space-md) 0 0;
    font-family: var(--font-display);
    font-size: clamp(2.3rem, 5.5vw, 4.4rem);
    font-weight: var(--font-medium);
    line-height: 0.95;
}

.not-found__message {
    width: min(100%, 31rem);
    margin: var(--space-lg) 0 0;
    font-size: clamp(1rem, 2vw, 1.18rem);
    line-height: 1.6;
    opacity: 0.72;
}

.not-found__actions {
    display: flex;
    justify-content: center;
    gap: var(--space-md);
    margin-top: var(--space-xl);
    flex-wrap: wrap;
}
</style>