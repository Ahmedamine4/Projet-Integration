<script setup>
import AboutMe from '@/components/portfolio/AboutMe.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

</script>

<template>
<AboutMe :user-id="authStore.user.utilisateur_id"/>
</template>
