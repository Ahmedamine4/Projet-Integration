<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import Error from '@/components/Error.vue';
import Divider from '@/components/Divider.vue';

const authStore = useAuthStore();
const router = useRouter();
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirm = ref('');
const serverError = ref('');
const errors = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
});
errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
};
const isValidName = (name) => {
    return /^[A-Za-z]{1,50}$/.test(name);
};

const register = async () => {
errors.value = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    };
    serverError.value= '';
    const trimmedFirstName = firstName.value.trim();
    const trimmedLastName = lastName.value.trim();
    const trimmedEmail = email.value.trim();

     if (!isValidName(trimmedFirstName)) {
        errors.value.firstName = "invalid first name";
        return;
    }
     if (!isValidName(trimmedLastName)) {
        errors.value.lastName = "invalid last name";
        return;
    }

     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.value.email = "invalid email";
        return;
    }
    if (password.value != confirm.value ){
        errors.value.password = "Passwords do not match";
        return;
    }

    try {
        await authStore.register({
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: trimmedEmail,
            password: password.value,
            confirm: confirm.value
        });
        router.push('/dashboard');
    }
   catch (err) {
      if (!err.response) {
      serverError.value = "Network error. Please try again.";
    } else {
      serverError.value = err.response.data?.message || "Something went wrong";
    }
  }
};

const registerWithGoogle = async () => {
    try {
        await authStore.startGoogleAuth();
    }
    catch(err) {
        serverError.value = err.message;
    } 
};
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
            <p v-if="errors.firstName" class="field-error">
              {{ errors.firstName }}
            </p>

            <Input
                v-model="lastName"
                label="Last name"
                placeholder="Last name"
                autocomplete="family-name"
            />
            <p v-if="errors.lastName" class="field-error">
               {{ errors.lastName }} 
            </p>
            <Input
                v-model="email"
                label="Email"
                placeholder="email"
            />
            <p v-if="errors.email" class="field-error">
               {{ errors.email }}
            </p>
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
            <p v-if="errors.password" class="field-error">
             {{ errors.password }}
            </p>
            <Button
                variant="submit"
                block
                :disabled="
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !email ||
                    !password||
                    !confirm"
            >
                Register
            </Button>
            <p v-if="serverError" class="global-error">
              ⚠ {{ serverError }}
            </p>

            <Divider>Or continue with Google</Divider>

            <Button
                type="button"
                variant="google"
                block
                @click="registerWithGoogle"
            >
                Continue with Google
            </Button>


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
.field-error {
  color: var(--color-error);
  font-size: 12px;
  margin-top: -15px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.global-error {
  color: var(--color-error);
  font-size: 13px;
  margin-top: 12px;
  text-align: center;
}
</style>
