<script setup>
import { MessageSquareWarning } from 'lucide-vue-next';
defineProps({
  writerName: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class="message">
    <div class="warning">
      <MessageSquareWarning :size="12" />
    </div>
    <div class="message-content">
      <strong>{{ writerName? `${writerName}:` : '' }}</strong>
      <span><slot /></span>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  gap: var(--space-md);
  align-items: flex-start;
  background: rgba(var(--color-secondary-rgb), 0.07);
  padding: var(--space-md);
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.08);
}

.warning {
  background-color: rgba(var(--color-secondary-rgb), 0.18);
  width: 1.5rem;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-secondary);
}

.message-content {
  font-size: var(--font-size-sm);
  font-weight: var(--font-regular);
}

.message-content strong {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-xs);
  color: var(--color-secondary);
}
</style>