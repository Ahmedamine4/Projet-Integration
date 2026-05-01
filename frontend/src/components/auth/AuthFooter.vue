<script setup>
defineProps({
  message: {
    type: String,
    default: "",
  },
  linkText: {
    type: String,
    default: "",
  },
  to: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <p class="auth-footer">
    {{ message }}
    <RouterLink :to>
      {{ linkText }}
    </RouterLink>
  </p>
</template>

<style scoped>
.auth-footer {
  margin: 1.1rem 0 0;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-primary-hover);
}

.auth-footer a {
  color: var(--color-secondary);
  font-weight: var(--font-medium);
  text-decoration: none;
}

.auth-footer a:hover,
.auth-footer a:focus-visible {
  text-decoration: underline;
  outline: none;
}
</style>
