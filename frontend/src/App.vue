<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from './layouts/AuthLayout.vue';

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
