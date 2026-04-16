<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const name = ref('');
const email = ref('');
const role = ref('student');
const password = ref('');
const confirm = ref('');
const error = ref('');

const register = async () => {
    try {
        await authStore.register({
            name: name.value,
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
    <div class="card">
        <h2>Register</h2>
        <div class="role-switch">
            <input type="radio" id="student" value="student" v-model="role">
            <label for="student" :class="{selected: role === 'student'}">Student</label>

            <input type="radio" id="teacher" value="teacher" v-model="role" >
            <label for="teacher" :class="{selected: role === 'teacher'}">Teacher</label>

            <input type="radio" id="professional" value="professional" v-model="role">
            <label for="professional" :class="{selected: role === 'professional'}">Professional</label>
        </div>

        <input v-model="name" placeholder="name" />

        <input v-model="email" placeholder="email" />

        <input type="password" v-model="password" placeholder="password" />

        <input type="password" v-model="confirm" placeholder="confirm password" />

        <button @click="register">Register</button>
        <p class="error">{{error}}</p>
    </div>
</template>

<style scoped>
.role-switch {
    display: flex;
    border: 1px solid black;
    width: 60%;
    justify-content: space-between;
    border-radius: 3px;
    padding: 2px;
    margin: 10px auto;
}

.role-switch input {
  display: none;
}

.role-switch label {
    flex: 1;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 3px;
    text-align: center;
    transition: all 0.15s ease;
}

.selected {
    background-color: black;
    color: white;
    font-weight: bold;
}

</style>