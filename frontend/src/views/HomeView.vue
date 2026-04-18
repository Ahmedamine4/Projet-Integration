<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '@/components/BaseButton.vue';

const router = useRouter();
</script>

<template>
    <section class="home-hero">
        <header class="home-hero__nav">
            <BaseButton variant="ghost" size="sm" @click="router.push('/login')">
                Sign in
            </BaseButton>
            <BaseButton variant="pill" size="sm" @click="router.push('/register')">
                Sign up
            </BaseButton>
        </header>

        <div class="home-hero__content">
            <p class="home-hero__eyebrow">Build, verify, and present your best work</p>

            <h1 class="hero-title hero-title--top">
                Your <span class="hero-title__strong">Portfolio,</span>
            </h1>

            <h2 class="hero-title hero-title--bottom">
                Certified for the Real World
            </h2>
        </div>
    </section>
</template>

<style scoped>
.home-hero {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
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
    gap: 0.9rem;
    padding: 2.2rem 3rem 0;
}

.home-hero__content {
    width: min(100% - 3rem, 58rem);
    margin: clamp(0.75rem, 3vh, 2rem) auto 0;
    padding: 2rem 0 0;
    text-align: center;
}

.home-hero__eyebrow {
    margin: 0 0 1.2rem;
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
        gap: 0.6rem;
    }
    .home-hero__content {
        width: min(100% - 2rem, 36rem);
        margin-top: clamp(1rem, 3.5vh, 2rem);
    }

    .hero-title {
        line-height: 0.98;
    }
}
</style>
