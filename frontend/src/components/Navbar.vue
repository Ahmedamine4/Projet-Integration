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
            <BaseButton variant="ghost" size="xs" @click="router.push('/')">Home</BaseButton>
            <BaseButton variant="ghost" size="xs" @click="router.push('/login')">Login</BaseButton>
            <BaseButton variant="pill" size="xs" @click="router.push('/register')">Register</BaseButton>
        </div>
        <div v-else class="nav-actions">
            <span class="nav-user">{{authStore.user.name}} ({{authStore.user.role}})</span>
            <BaseButton variant="ghost" size="sm" @click="logout">Logout</BaseButton>
        </div>
    </nav>
</template>

<style scoped>
nav {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-sm);
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
    min-width: 0;
    margin-left: auto;
}

.nav-user {
    min-width: 0;
    font-size: var(--font-size-sm);
    overflow-wrap: anywhere;
}

@media (max-width: 768px) {
    nav {
        padding: var(--space-sm) var(--space-md);
    }

    .nav-actions {
        gap: 0.75rem;
    }
}

@media (max-width: 480px) {
    .brand-mark {
        font-size: 1.15rem;
    }

    .nav-actions {
        gap: var(--space-xs);
    }

    .nav-user {
        font-size: var(--font-size-xs);
    }
}
</style>
