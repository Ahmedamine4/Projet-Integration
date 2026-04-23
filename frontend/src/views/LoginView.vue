<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';
import Button from '@/components/Button.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import Error from '@/components/Error.vue';
import Divider from '@/components/Divider.vue';

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
            
            <Divider>Or continue with Google</Divider>

            <Button
                type="button"
                variant="google"
                block
                @click="loginWithGoogle"
            >
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
</style>
