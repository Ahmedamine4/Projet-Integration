<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import Button from '@/components/common/Button.vue';
import Card from '@/components/common/Card.vue';
import Input from '@/components/common/Input.vue';
import AuthFooter from '@/components/auth/AuthFooter.vue';
import Divider from '@/components/common/Divider.vue';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue';
import Error from '@/components/common/Error.vue';

const authStore = useAuthStore();
const router = useRouter();
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirm = ref('');

const isRegistering = ref(false);
const isGoogleLoading = ref(false);

const serverError = ref('');
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirm: '',
});

const isValidName = (name) => {
  const regex = /^(?=.{1,50}$)[A-Za-z]+(?: [A-Za-z]+)*$/;
  return regex.test(name);
};

const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
};

const register = async () => {
  errors.firstName = '';
  errors.lastName = '';
  errors.email = '';
  errors.password = '';
  errors.confirm = '';

  serverError.value = '';
  const trimmedFirstName = firstName.value.trim();
  const trimmedLastName = lastName.value.trim();
  const trimmedEmail = email.value.trim();

  if (!isValidName(trimmedFirstName)) errors.firstName = 'Invalid first name';

  if (!isValidName(trimmedLastName)) errors.lastName = 'Invalid last name';

  if (!isValidEmail(trimmedEmail)) errors.email = 'Invalid email address';

  if (!isValidPassword(password.value))
    errors.password = 'Password is not strong enouth';

  if (password.value !== confirm.value)
    errors.confirm = 'Passwords do not match';

  if (
    errors.firstName ||
    errors.lastName ||
    errors.email ||
    errors.password ||
    errors.confirm
  )
    return;

  isRegistering.value = true;

  try {
    await authStore.register({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      password: password.value,
    });
    await router.push('/getting-started');
  } catch (err) {
    if (!err.response) serverError.value = 'Network error. Please try again.';
    else serverError.value = err.response.data?.error || 'Something went wrong';
  } finally {
    isRegistering.value = false;
  }
};

const registerWithGoogle = async () => {
  serverError.value = '';
  isGoogleLoading.value = true;
  try {
    await authStore.startGoogleAuth();
  } catch (err) {
    serverError.value = err.message;
    isGoogleLoading.value = false;
  }
};
</script>

<template>
  <Card title="Register" size="sm">
    <p class="auth-subtitle">Create an account to get started</p>
    <form class="auth-form" @submit.prevent="register">
      <div class="field">
        <Input
          v-model="firstName"
          label="First name"
          placeholder="First name"
          autocomplete="given-name"
        />
        <Error v-if="errors.firstName" variant="field">
          {{ errors.firstName }}
        </Error>
      </div>

      <div class="field">
        <Input
          v-model="lastName"
          label="Last name"
          placeholder="Last name"
          autocomplete="family-name"
        />

        <Error v-if="errors.lastName" variant="field">
          {{ errors.lastName }}
        </Error>
      </div>

      <div class="field">
        <Input v-model="email" label="Email" placeholder="email" />

        <Error v-if="errors.email" variant="field">
          {{ errors.email }}
        </Error>
      </div>

      <div class="password-group">
        <div class="field">
          <Input
            v-model="password"
            label="Password"
            type="password"
            placeholder="password"
          />

          <Error v-if="errors.password" variant="field">
            {{ errors.password }}
          </Error>

          <PasswordStrengthMeter :password />
        </div>

        <div class="field">
          <Input
            v-model="confirm"
            label="Confirm password"
            type="password"
            placeholder="confirm password"
          />

          <Error v-if="errors.confirm" variant="field">
            {{ errors.confirm }}
          </Error>
        </div>
      </div>

      <div class="submit-row">
        <Button
          variant="submit"
          block
          :loading="isRegistering"
          :disabled="
            isRegistering ||
            isGoogleLoading ||
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirm
          "
        >
          Register
        </Button>
      </div>

      <Divider>Or continue with Google</Divider>

      <Button
        type="button"
        variant="google"
        block
        :loading="isGoogleLoading"
        :disabled="isRegistering || isGoogleLoading"
        @click="registerWithGoogle"
      >
        Continue with Google
      </Button>

      <Error v-if="serverError">
        {{ serverError }}
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
  gap: var(--space-md);
}

.auth-subtitle {
  margin: 0 0 var(--space-lg);
  font-size: var(--font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary-hover);
}

.password-group {
  display: grid;
  gap: var(--space-sm);
}

.submit-row {
  margin-top: var(--space-sm);
}

.field {
  display: grid;
  gap: var(--space-xs);
}
</style>
