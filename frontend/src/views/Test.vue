<script setup>
import Sidebar from '@/components/Sidebar.vue';
</script>

<template>
    <main>
        <Sidebar />
        <div class="content">
            <p v-for="i in 30" :key="i">Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus dolore quasi consequatur magnam autem modi nostrum! Nulla nam ex adipisci ad illo, libero sapiente rem, distinctio cumque, neque veritatis commodi.</p>
        </div>
    </main>
</template>

<style scoped>
main {
    display: flex;
    min-height: 3000px;
}

p {
    margin: 1rem;
    flex: 1;
}
</style>

