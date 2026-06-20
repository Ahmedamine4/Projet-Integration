<script setup>
import { LoaderCircle, UserCheck, UserPlus } from 'lucide-vue-next';

defineProps({
  following: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle']);
</script>

<template>
  <button
    type="button"
    class="follow-button"
    :class="{
      'follow-button--following': following,
      'follow-button--loading': loading,
    }"
    :disabled="loading"
    :aria-pressed="following"
    @click="$emit('toggle')"
  >
    <LoaderCircle
      v-if="loading"
      class="follow-button__spinner"
      :size="12"
      :stroke-width="2.25"
    />
    <UserCheck
      v-else-if="following"
      :size="12"
      :stroke-width="2.25"
    />
    <UserPlus
      v-else
      :size="12"
      :stroke-width="2.25"
    />
    <span>{{ following ? 'Following' : 'Follow' }}</span>
  </button>
</template>

<style scoped>
.follow-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-width: 6.2rem;
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: 0.45rem var(--space-md);
  background-color: var(--color-primary);
  color: var(--color-background);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
  font: inherit;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.follow-button:not(:disabled):hover {
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
  transform: translateY(-1px);
}

.follow-button:focus-visible {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.follow-button--following {
  border-color: rgba(var(--color-secondary-rgb), 0.82);
  background-color: rgba(var(--color-secondary-rgb), 0.12);
  color: var(--color-secondary);
  box-shadow: 0 6px 12px rgba(var(--color-secondary-rgb), 0.12);
}

.follow-button--following:not(:disabled):hover {
  border-color: var(--color-secondary);
  background-color: rgba(var(--color-secondary-rgb), 0.18);
  box-shadow: 0 7px 14px rgba(var(--color-secondary-rgb), 0.16);
}

.follow-button:disabled {
  cursor: wait;
  opacity: 0.78;
  transform: none;
}

.follow-button svg {
  flex: 0 0 auto;
}

.follow-button__spinner {
  animation: follow-spin 0.85s linear infinite;
}

@keyframes follow-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
