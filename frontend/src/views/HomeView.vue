<script setup>
    import { useRouter } from 'vue-router';
    const router = useRouter();
</script>

<template>
    <div>
        <h1>Portfolio Builder</h1>
        <p>Create and manage your portfolio.</p>
        <button @click="router.push('/register')">Get Started</button>
    </div>
</template>