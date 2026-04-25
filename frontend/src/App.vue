<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import router from './router';

const route = useRoute();

const isAuthRoute = computed(() => route.meta.layout === 'auth');

</script>

<template>
    <div id="app">
        <AuthLayout v-if="isAuthRoute">
            <router-view />
        </AuthLayout>

        <template v-else>
            <main>
                <router-view />
            </main>
        </template>
    </div>
</template>
