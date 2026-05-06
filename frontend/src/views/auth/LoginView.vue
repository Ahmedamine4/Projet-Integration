<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import Card from '@/components/common/Card.vue';
import Input from '@/components/common/Input.vue';
import Button from '@/components/common/Button.vue';
import AuthFooter from '@/components/auth/AuthFooter.vue';
import Divider from '@/components/common/Divider.vue';
import Error from '@/components/common/Error.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');

const isLoggingIn = ref(false);
const isGoogleLoading = ref(false);

const serverError = ref('');
const errors = reactive({ email: '' });

const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const login = async () => {
  errors.email = '';
  serverError.value = '';

  const trimmedEmail = email.value.trim();
  if (!isValidEmail(trimmedEmail)) {
    errors.email = 'Invalid email address';
    return;
  }

  isLoggingIn.value = true;

  try {
    await authStore.login(trimmedEmail, password.value);

    const redirectPath =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/dashboard';
    await router.push(redirectPath);
  } catch (err) {
    if (!err.response) serverError.value = 'Network error. Please try again.';
    else {
      serverError.value = err.response.data?.error || 'Something went wrong';
    }
  } finally {
    isLoggingIn.value = false;
  }
};

const loginWithGoogle = async () => {
  serverError.value = '';
  isGoogleLoading.value = true;
  try {
    const redirectPath =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/dashboard';

    sessionStorage.setItem('auth_redirect', redirectPath);

    await authStore.startGoogleAuth();
  } catch (err) {
    serverError.value = err.message;
    isGoogleLoading.value = false;
  }
};
</script>

<template>
  <Card title="Welcome back" size="sm">
    <p class="auth-subtitle">Sign in to your account to continue</p>

    <form class="auth-form" @submit.prevent="login">
      <div class="field">
        <Input
          v-model="email"
          label="Email address"
          placeholder="name@company.com"
          autocomplete="email"
        />

        <Error v-if="errors.email" variant="field">
          {{ errors.email }}
        </Error>
      </div>
      <div class="field">
        <Input
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </div>
      <div class="submit-row">
        <Button
          block
          variant="submit"
          :loading="isLoggingIn"
          :disabled="isLoggingIn || isGoogleLoading || !email || !password"
        >
          Sign In
        </Button>
      </div>

      <Divider>Or continue with Google</Divider>

      <Button
        type="button"
        variant="google"
        block
        :loading="isGoogleLoading"
        :disabled="isLoggingIn || isGoogleLoading"
        @click="loginWithGoogle"
      >
        Continue with Google
      </Button>

      <Error v-if="serverError">
        {{ serverError }}
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
  gap: var(--space-md);
}

.auth-subtitle {
  margin: 0 0 var(--space-lg);
  font-size: var(--font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary-hover);
}

.field {
  display: grid;
  gap: var(--space-xs);
}

.submit-row {
  margin-top: var(--space-sm);
}
</style>
