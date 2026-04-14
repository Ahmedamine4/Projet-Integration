<script setup>
import Navbar from './components/Navbar.vue';
</script>

<template>
    <div id="app">
        <Navbar />
        <div class="container">
            <router-view />
        </div>
    </div>
</template>