<script setup>
    import { useRouter } from 'vue-router';
    const router = useRouter();
</script>

<template>
    <div>
        <div class="home_section_1">
            <h1 class="title_brand">Your <span class="bold">Portfolio,</span></h1>
            <h1 class="title_brand">Certified for the Real World</h1>
        </div>
        <p>Create and manage your portfolio.</p>
        <button @click="router.push('/register')">Get Started</button>
    </div>
</template>