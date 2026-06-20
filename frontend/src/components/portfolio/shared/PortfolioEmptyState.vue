<script setup>
import { FileText } from 'lucide-vue-next';

defineProps({
  as: {
    type: String,
    default: 'div',
  },
  message: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <component
    :is="as"
    class="portfolio-empty-state"
  >
    <FileText :size="18" />
    <strong>{{ message }}</strong>
  </component>
</template>

<style scoped>
.portfolio-empty-state {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: 0;
  background-color: rgba(var(--color-surface-rgb), 0.42);
  border: 1.5px dashed rgba(var(--color-primary-rgb), 0.22);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  color: rgba(var(--color-primary-rgb), 0.68);
}

.portfolio-empty-state strong {
  font-size: var(--font-size-sm);
  font-weight: var(--font-regular);
}
</style>
