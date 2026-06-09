<script setup>
import BaseButton from '@/components/common/actions/BaseButton.vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <BaseButton
    variant="submit"
    class="delete-button"
    :loading
    :disabled
  >
    <slot>Delete</slot>
  </BaseButton>
</template>

<style scoped>
.delete-button {
  background-color: var(--color-error);
  box-shadow: 0 12px 24px rgba(var(--color-error-rgb), 0.24);
}

.delete-button:hover:not(:disabled),
.delete-button:focus-visible {
  outline: none;
  background: color-mix(in srgb, var(--color-error) 88%, white);
}
</style>
