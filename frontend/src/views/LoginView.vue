<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseSubmitButton from '@/components/BaseSubmitButton.vue';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
    try {
        await authStore.login(email.value, password.value);
        router.push('/dashboard');
    }
    catch(err) {
        error.value = err.message;
    }
}
</script>

<template>

    <BaseCard
        title="Welcome back"
        fullWidth
        size="md"
    >
        <p class="auth-subtitle">
            Sign in to your account to continue
        </p>

        <form class="auth-form" @submit.prevent="login">

            <BaseInput
                v-model="email"
                label="Email address"
                placeholder="name@company.com"
                autocomplete="email"
            />

            <BaseInput
                v-model="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                autocomplete="current-password"
            />
            
            <p v-if="error" class="auth-error">
                {{ error }}
            </p>
            
            <BaseSubmitButton
                block
                :disabled="!email.includes('@') || password.length < 8"
            >
                Sign In
            </BaseSubmitButton>
        </form>

        <p class="auth-footer">
            Don't have an account?
            <RouterLink to="/register">
                Register now
            </RouterLink>
        </p>
    </BaseCard>
</template>

<style scoped>

.auth-form {
    display: grid;
    gap: 1rem;
}

.auth-subtitle {
    margin: 0 0 var(--space-lg);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-primary-hover);
}

.auth-error {
    margin: -0.35rem 0 0.9rem;
    font-size: var(--font-size-sm);
    color: var(--color-error);
}

.auth-footer {
    margin: 1.1rem 0 0;
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--color-primary-hover);
}

.auth-footer a {
    color: var(--color-secondary);
    font-weight: var(--font-medium);
    text-decoration: none;
}

.auth-footer a:hover {
    text-decoration: underline;
}
</style>
