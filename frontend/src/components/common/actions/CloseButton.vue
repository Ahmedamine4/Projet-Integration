<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  size: {
    type: String,
    default: 'md',
  },
});
</script>

<template>
  <button
    type="button"
    class="x-button"
    :class="`x-button--${size}`"
  >
    <X />
  </button>
</template>

<style scoped>
.x-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 999px;
  color: rgba(var(--color-primary-rgb), 0.7);
  cursor: pointer;
  transition: var(--transition-fast);
}

.x-button svg {
  width: 70%;
  height: 70%;
}

.x-button:hover {
  color: var(--color-error);
  background: rgba(var(--color-error-rgb), 0.06);
}

.x-button--md {
  width: 1.38rem;
}

.x-button--lg {
  width: 1.56rem;
}

@media (max-width: 480px) {
  .x-button--md {
    width: 1.82rem;
  }
}
</style>
