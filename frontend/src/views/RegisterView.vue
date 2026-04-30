<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import Divider from '@/components/Divider.vue';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter.vue';

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
    confirm: ''
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

    if (!isValidName(trimmedFirstName))
        errors.firstName = "Invalid first name";

    if (!isValidName(trimmedLastName))
        errors.lastName = "Invalid last name";

    if (!isValidEmail(trimmedEmail))
        errors.email = "Invalid email address";

    if (!isValidPassword(password.value))
        errors.password = "Password is not strong enouth";

    if (password.value !== confirm.value)
        errors.confirm = "Passwords do not match";

    if (
        errors.firstName ||
        errors.lastName ||
        errors.email ||
        errors.password ||
        errors.confirm
    ) return;

    isRegistering.value = true;

    try {
        await authStore.register({
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: trimmedEmail,
            password: password.value
        });
        await router.push('/dashboard');
    }
    catch (err) {
        if (!err.response)
            serverError.value = "Network error. Please try again.";
        else
            serverError.value =
                err.response.data?.message ||
                "Something went wrong";
    }
    finally {
        isRegistering.value = false;
    }
};

const registerWithGoogle = async () => {
    serverError.value = '';
    isGoogleLoading.value = true;
    try {
        await authStore.startGoogleAuth();
    }
    catch(err) {
        serverError.value = err.message;
        isGoogleLoading.value = false;
    } 
};
</script>

<template>
    <Card title="Register" size="sm">
        <p class="auth-subtitle">
           Create an account to get started
        </p>
        <form class="auth-form" @submit.prevent="register">
            <div class="field">
                <Input
                    v-model="firstName"
                    label="First name"
                    placeholder="First name"
                    autocomplete="given-name"
                />
                <p v-if="errors.firstName" class="field-error">
                    {{ errors.firstName }}
                </p>
            </div>

            <div class="field">
                <Input
                    v-model="lastName"
                    label="Last name"
                    placeholder="Last name"
                    autocomplete="family-name"
                />

                <p v-if="errors.lastName" class="field-error">
                    {{ errors.lastName }} 
                </p>
            </div>

            <div class="field">
                <Input
                    v-model="email"
                    label="Email"
                    placeholder="email"
                />

                <p v-if="errors.email" class="field-error">
                    {{ errors.email }}
                </p>
            </div>

            <div class="password-group">
                <div class="field">
                    <Input
                        v-model="password"
                        label="Password"
                        type="password"
                        placeholder="password"
                    />

                    <p v-if="errors.password" class="field-error">
                        {{ errors.password }}
                    </p>

                    <PasswordStrengthMeter :password />
                </div>

                <div class="field">
                    <Input
                        v-model="confirm"
                        label="Confirm password"
                        type="password"
                        placeholder="confirm password"
                    />

                    <p v-if="errors.confirm" class="field-error">
                        {{ errors.confirm }}
                    </p>
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
                        !confirm"
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

            <p v-if="serverError" class="global-error">
                {{ serverError }}
            </p>

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

.field-error {
    color: var(--color-error);
    font-size: 12px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.global-error {
    color: var(--color-error);
    font-size: 13px;
    text-align: center;
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
