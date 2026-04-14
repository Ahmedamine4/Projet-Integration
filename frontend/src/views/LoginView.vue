<template>
  <div>
    <h1>Login</h1>

    <form @submit.prevent="login">
      <div>
        <input v-model="email" placeholder="email" />
      </div>

      <div>
        <input v-model="password" type="password" placeholder="password" />
      </div>

      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"

const email = ref("")
const password = ref("")

function login() {
  console.log("Login attempt:", email.value, password.value)
}
</script>