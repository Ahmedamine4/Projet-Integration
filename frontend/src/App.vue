<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();

const isHomeRoute = computed(() => route.name === 'home');
</script>

<template>
    <div id="app">
        <Navbar v-if="!isHomeRoute" />
        <main :class="`app-shell ${isHomeRoute ? 'app-shell--full' : 'container'}`">
            <router-view />
        </main>
    </div>
</template>

<style scoped>
#app {
    min-height: 100vh;
}

.app-shell {
    min-height: 100vh;
}

.app-shell--full {
    width: 100%;
}
</style>
