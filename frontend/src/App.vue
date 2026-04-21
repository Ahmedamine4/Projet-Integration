<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import router from './router';

const route = useRoute();

const isAuthRoute = computed(() => route.meta.layout === 'auth');

const fullScreenRoutes = ['home'];

const isFullScreenRoute = computed(() => {
    return fullScreenRoutes.includes(route.name);
});

</script>

<template>
    <div id="app">
        <AuthLayout v-if="isAuthRoute">
            <router-view />
        </AuthLayout>

        <template v-else>
            <Navbar v-if="!isFullScreenRoute" />
            <main :class="`app-shell ${isFullScreenRoute ? 'app-shell--full' : 'container'}`">
                <router-view />
            </main>
        </template>
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
