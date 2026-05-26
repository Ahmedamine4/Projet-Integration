<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import AuthFooter from '@/components/auth/AuthFooter.vue';
import BaseDivider from '@/components/common/BaseDivider.vue';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue';
import BaseError from '@/components/common/BaseError.vue';

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
  <BaseCard
    title="Register"
    size="sm"
  >
    <p class="auth-subtitle">
      Create an account to get started
    </p>
    <form
      class="auth-form"
      @submit.prevent="register"
    >
      <div class="field">
        <BaseInput
          v-model="firstName"
          label="First name"
          placeholder="First name"
          autocomplete="given-name"
        />
        <BaseError
          v-if="errors.firstName"
          variant="field"
        >
          {{ errors.firstName }}
        </BaseError>
      </div>

      <div class="field">
        <BaseInput
          v-model="lastName"
          label="Last name"
          placeholder="Last name"
          autocomplete="family-name"
        />

        <BaseError
          v-if="errors.lastName"
          variant="field"
        >
          {{ errors.lastName }}
        </BaseError>
      </div>

      <div class="field">
        <BaseInput
          v-model="email"
          label="Email"
          placeholder="email"
        />

        <BaseError
          v-if="errors.email"
          variant="field"
        >
          {{ errors.email }}
        </BaseError>
      </div>

      <div class="password-group">
        <div class="field">
          <BaseInput
            v-model="password"
            label="Password"
            type="password"
            placeholder="password"
          />

          <BaseError
            v-if="errors.password"
            variant="field"
          >
            {{ errors.password }}
          </BaseError>

          <PasswordStrengthMeter :password />
        </div>

        <div class="field">
          <BaseInput
            v-model="confirm"
            label="Confirm password"
            type="password"
            placeholder="confirm password"
          />

          <BaseError
            v-if="errors.confirm"
            variant="field"
          >
            {{ errors.confirm }}
          </BaseError>
        </div>
      </div>

      <div class="submit-row">
        <BaseButton
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
        </BaseButton>
      </div>

      <BaseDivider>
        Or continue with Google
      </BaseDivider>

      <BaseButton
        type="button"
        variant="google"
        block
        :loading="isGoogleLoading"
        :disabled="isRegistering || isGoogleLoading"
        @click="registerWithGoogle"
      >
        Continue with Google
      </BaseButton>

      <BaseError v-if="serverError">
        {{ serverError }}
      </BaseError>
    </form>
    <AuthFooter
      message="Already have an account?"
      link-text="Login now"
      to="/login"
    />
  </BaseCard>
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
