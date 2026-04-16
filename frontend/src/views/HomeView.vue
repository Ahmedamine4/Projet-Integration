<script setup>
    import { useRouter } from 'vue-router';
    const router = useRouter();
</script>

<template>
    <div>
        <div class="home_section_1">
            <h1 class="title_brand">Your <span class="bold">Portfolio,</span></h1>
            <h1 class="title_brand">Certified for the Real World</h1>
            <p>Create and manage your portfolio.</p>
            <button @click="router.push('/register')">Get Started</button>
        </div>
    </div>
</template>

<style scoped>
.title_brand {
    letter-spacing: 1px;
    font-family: var(--font-display);
    font-weight: var(--font-medium);
    color: var(--color-primary);
    white-space: nowrap;
    font-size: clamp(1.5rem, 8vw ,5rem);
    margin: 0;
    
}
.home_section_1{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: var(--space-xs);
    width: 100%;
    height: 70vh;
}
</style>