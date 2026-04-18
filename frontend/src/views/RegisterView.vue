<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseSwitcher from '@/components/BaseSwitcher.vue';

const authStore = useAuthStore();
const router = useRouter();
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const role = ref('student');
const password = ref('');
const confirm = ref('');
const error = ref('');
const roleOptions = [
    { label: 'Student', value: 'student' },
    { label: 'Teacher', value: 'teacher' },
    { label: 'Professional', value: 'professional' },
];

const register = async () => {
    try {
        await authStore.register({
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            role: role.value,
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
        <BaseSwitcher
            v-model="role"
            name="register-role"
            :options="roleOptions"
        />

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

        <BaseButton class="auth-button" @click="register">Register</BaseButton>
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
