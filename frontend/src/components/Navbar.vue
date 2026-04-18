<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import BaseButton from './BaseButton.vue';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
    authStore.logout();
    router.push('/');
};
</script>

<template>
    <nav>
        <div class="brand-mark">
            Port<span class="brand-mark__strong">Craft</span>
        </div>
        <div v-if="!authStore.user" class="nav-actions">
            <BaseButton variant="ghost" size="sm" @click="router.push('/')">Home</BaseButton>
            <BaseButton variant="ghost" size="sm" @click="router.push('/login')">Login</BaseButton>
            <BaseButton variant="pill" size="sm" @click="router.push('/register')">Register</BaseButton>
        </div>
        <div v-else class="nav-actions">
            {{authStore.user.name}} ({{authStore.user.role}})
            <BaseButton variant="ghost" size="sm" @click="logout">Logout</BaseButton>
        </div>
    </nav>
</template>

<style scoped>
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--color-primary-hover);
    background-color: var(--color-background);
    color: var(--color-primary);
}

.brand-mark {
    margin: 0;
    font-family: var(--font-ui);
    font-size: clamp(1.25rem, 1.2rem + 0.8vw, 1.7rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    text-transform: none;
}

.brand-mark__strong {
    font-family: var(--font-stencil);
    font-size: 0.95em;
    font-weight: var(--font-regular);
    letter-spacing: 0.01em;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

@media (max-width: 768px) {
    nav {
        padding: var(--space-sm) var(--space-md);
    }

    .nav-actions {
        gap: 0.75rem;
    }
}
</style>
