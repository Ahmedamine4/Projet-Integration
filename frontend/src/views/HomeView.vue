<script setup>
import { useRouter } from 'vue-router';
import Button from '@/components/Button.vue';

const router = useRouter();
</script>

<template>
    <section class="home-hero">
        <header class="home-hero__nav">
            <Button variant="ghost" size="xs" @click="router.push('/login')">
                Sign in
            </Button>
            <Button variant="pill" size="xs" @click="router.push('/register')">
                Sign up
            </Button>
        </header>

        <div class="home-hero__content">

            <h1 class="hero-title hero-title--top">
                Your <span class="hero-title__strong">Portfolio,</span>
            </h1>

            <h2 class="hero-title hero-title--bottom">
                Certified for the Real World
            </h2>
            <p class="home-hero__tagline">Build, verify, and present your best work</p>
        </div>
    </section>
</template>

<style scoped>
.home-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background:
        linear-gradient(225deg, rgba(var(--color-secondary-rgb), 0.22), transparent 38%),
        linear-gradient(140deg, rgba(var(--color-primary-rgb), 0.05), transparent 42%),
        linear-gradient(200deg, var(--color-background), var(--color-background) 48%, var(--color-surface) 100%);
    color: var(--color-primary);
}

.home-hero__nav {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--space-md);
    padding: 2.2rem 3rem 0;
}

.home-hero__content {
    width: min(100% - 3rem, 58rem);
    margin: clamp(0.75rem, 3vh, 2rem) auto 0;
    padding: 2rem 0 0;
    text-align: center;
}

.home-hero__tagline {
    margin: var(--space-xl) 0 1.2rem;
    font-size: 0.86rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.7;
}

.hero-title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--font-medium);
    line-height: 0.9;
    letter-spacing: -0.05em;
}

.hero-title--top {
    font-size: clamp(3.8rem, 9vw, 8rem);
}

.hero-title--bottom {
    font-size: clamp(2.8rem, 7vw, 6.3rem);
    margin-top: 0.8rem;
}

.hero-title__strong {
    font-weight: var(--font-bold);
}

@media (max-width: 768px) {
    .home-hero__nav {
        padding: 1.5rem 1.25rem 0;
        gap: var(--space-sm);
        flex-wrap: wrap;
    }

    .home-hero__content {
        width: min(100% - 2rem, 36rem);
        margin-top: clamp(1rem, 3.5vh, 2rem);
    }

    .hero-title {
        line-height: 0.98;
    }
}

@media (max-width: 480px) {
    .home-hero__nav {
        justify-content: center;
        gap: var(--space-xs);
        padding-top: var(--space-md);
    }

    .home-hero__content {
        width: min(100% - 1.5rem, 36rem);
        padding-top: 1.5rem;
    }
}
</style>
