<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import Error from '@/components/Error.vue';

const authStore = useAuthStore();
const router = useRouter();
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirm = ref('');
const error = ref('');

const register = async () => {
    try {
        await authStore.register({
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            password: password.value,
            confirm: confirm.value
        });
        router.push('/dashboard');
    }
    catch(err) {
        error.value = err.message;
    }
}
</script>

<template>
    <Card title="Register" size="sm">
        <p class="auth-subtitle">
           Create an account to get started
        </p>
        <form class="auth-form" @submit.prevent="register">
            <Input
                v-model="firstName"
                label="First name"
                placeholder="First name"
                autocomplete="given-name"
            />

            <Input
                v-model="lastName"
                label="Last name"
                placeholder="Last name"
                autocomplete="family-name"
            />

            <Input
                v-model="email"
                label="Email"
                placeholder="email"
            />

            <Input
                v-model="password"
                label="Password"
                type="password"
                placeholder="password"
            />

            <Input
                v-model="confirm"
                label="Confirm
                password"
                type="password"
                placeholder="confirm password"
            />

            <Button
                variant="submit"
                block
                :disabled="
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !email.includes('@') ||
                    password.length < 8 ||
                    password !== confirm"
            >
                Register
            </Button>

            <Error v-if="error">
                {{ error }}
            </Error>

        </form>
        <AuthFooter
            message="Already have an account?"
            link-text="Login now"
            to="/login"
        />
    </Card>
</template>

<style scoped>

.auth-form {
    display: grid;
    gap: 0.2rem;
}

.auth-subtitle {
    margin: 0 0 var(--space-lg);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-primary-hover);
}
</style>
