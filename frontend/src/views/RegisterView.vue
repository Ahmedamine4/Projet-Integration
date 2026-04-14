<template>
  <div>
    <h1>Register</h1>

    <form @submit.prevent="register">
      <div>
        <input v-model="name" placeholder="name" />
      </div>

      <div>
        <input v-model="email" placeholder="email" />
      </div>

      <div>
        <input v-model="password" type="password" placeholder="password" />
      </div>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"

const name = ref("")
const email = ref("")
const password = ref("")

function register() {
  console.log("Register:", name.value, email.value, password.value)
}
</script>