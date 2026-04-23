<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';
import Button from '@/components/Button.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import Error from '@/components/Error.vue';
import googleIcon from '@/assets/icons/google.svg'

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
};

const loginWithGoogle = async () => {
    try {
        await authStore.startGoogleAuth();
    }
    catch(err) {
        error.value = err.message;
    } 
};
</script>

<template>

    <Card title="Welcome back" size="sm">
        <p class="auth-subtitle">
            Sign in to your account to continue
        </p>

        <form class="auth-form" @submit.prevent="login">

            <Input
                v-model="email"
                label="Email address"
                placeholder="name@company.com"
                autocomplete="email"
            />

            <Input
                v-model="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                autocomplete="current-password"
            />
            
            <Button
                block
                variant="submit"
                :disabled="!email.includes('@') || password.length < 8"
            >
                Sign In
            </Button>

            <div class="auth-divider">
                <span>Or continue with Google</span>
            </div>

            <Button
                type="button"
                variant="pill"
                class="google-button"
                block
                @click="loginWithGoogle"
            >
                <img
                    :src="googleIcon"
                    alt="Google"
                    class="google-icon"
                />
                Continue with Google
            </Button>

            <Error v-if="error">
                {{ error }}
            </Error>
            
        </form>
        <AuthFooter
            message="Don't have an account?"
            link-text="Register now"
            to="/register"
        />
    </Card>
</template>
<style scoped>

.auth-form {
    display: grid;
    gap: 0.7rem;
}

.auth-subtitle {
    margin: 0 0 var(--space-lg);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-primary-hover);
}

.google-button {
    border-radius: 0.8rem;
}

.google-button img {
    height: 1rem;
    width: 1rem;
    margin: 0 0.5rem;
}

.auth-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-primary-hover);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.auth-divider::before,
.auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(var(--color-primary-rgb), 0.18);
}
</style>
