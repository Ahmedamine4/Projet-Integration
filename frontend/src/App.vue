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

.container {
    width: min(calc(100% - 2 * var(--space-lg)), 1100px);
    margin: 0 auto;
    padding: var(--space-xl) 0;
}

.app-shell {
    min-height: 100vh;
}

.app-shell--full {
    width: 100%;
}

@media (max-width: 768px) {
    .container {
        width: min(calc(100% - 2 * var(--space-md)), 1100px);
        padding: var(--space-lg) 0;
    }
}
</style>
