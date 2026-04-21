<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import BaseSubmitButton from '@/components/BaseSubmitButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';

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
    <BaseCard title="Register" class="register-card">

        <BaseInput
            v-model="firstName"
            label="First name"
            placeholder="First name"
            autocomplete="given-name"
        />

        <BaseInput
            v-model="lastName"
            label="Last name"
            placeholder="Last name"
            autocomplete="family-name"
        />

        <BaseInput v-model="email" label="Email" placeholder="email" />

        <BaseInput v-model="password" label="Password" type="password" placeholder="password" />

        <BaseInput v-model="confirm" label="Confirm password" type="password" placeholder="confirm password" />

        <BaseSubmitButton
            class="auth-button"
            @click="register"
            block
            :disabled="
                !firstName.trim() ||
                !lastName.trim() ||
                !email.includes('@') ||
                password.length < 8 ||
                password !== confirm"
        >
            Register
        </BaseSubmitButton>
        <p class="error">{{error}}</p>
    </BaseCard>
</template>

<style scoped>
.register-card {
    width: min(100%, 28rem);
    padding: var(--space-md);
}

.auth-button {
    display: flex;
    margin: 0 auto;
}

@media (max-width: 480px) {
    .register-card {
        width: 100%;
    }
}
</style>
