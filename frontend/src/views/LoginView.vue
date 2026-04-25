<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';
import Button from '@/components/Button.vue';
import Error from '@/components/Error.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import Divider from '@/components/Divider.vue';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const errors = ref({
  email: ''
});
errors.value = {
  email: ''
};

error.value = '';

const login = async () => {
    const trimmedEmail = email.value.trim();
     errors.value.email = '';
      error.value = '';
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
  errors.value.email = "Invalid email address";
  return;
}
    try {
        await authStore.login(email.value, password.value);
        router.push('/dashboard');
    }
    catch(err) {
       if (!err.response) {
      error.value = "Network error. Please try again.";
    } else {
      error.value = err.response.data?.message || "Something went wrong";
    }
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
            <p v-if="errors.email" class="field-error">
              {{ errors.email }}
            </p>
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
                :disabled="!email.trim() || !password"
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
.field-error {
  color: var(--color-error);
  font-size: 12px;
  margin-top: -20px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
