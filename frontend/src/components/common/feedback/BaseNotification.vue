<script setup>
import { CheckCircle, CircleX, X } from 'lucide-vue-next';

defineProps({
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'success'].includes(value),
  },
});

const emit = defineEmits(['close']);
</script>

<template>
  <Transition name="base-notification">
    <div
      v-if="message"
      class="base-notification"
      :class="`base-notification--${type}`"
      role="alert"
    >
      <CircleX
        v-if="type === 'error'"
        class="base-notification__icon"
        :size="26"
        aria-hidden="true"
      />
      <CheckCircle
        v-else
        class="base-notification__icon"
        :size="26"
        aria-hidden="true"
      />

      <span>{{ message }}</span>

      <button
        type="button"
        class="base-notification__close"
        aria-label="Dismiss notification"
        @click="emit('close')"
      >
        <X :size="20" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.base-notification {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  z-index: 1100;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.8rem;
  width: min(calc(100vw - 2rem), 30rem);
  min-height: 3.75rem;
  padding: 0.75rem 0.8rem 0.75rem 1rem;
  border: 1px solid var(--notification-border);
  border-radius: 0.45rem;
  background: var(--notification-background);
  color: var(--notification-color);
  box-shadow: 0 0.35rem 1rem var(--notification-shadow);
  font-size: var(--font-size-sm);
  font-weight: 700;
  line-height: 1.35;
  text-align: left;
  transform: translateX(-50%);
}

.base-notification--error {
  --notification-color: var(--color-error);
  --notification-border: color-mix(in srgb, var(--color-error) 42%, var(--color-background) 58%);
  --notification-background: color-mix(in srgb, var(--color-background) 72%, var(--color-error) 28%);
  --notification-shadow: rgba(var(--color-error-rgb), 0.12);
}

.base-notification--success {
  --notification-color: #2f6f35;
  --notification-border: color-mix(in srgb, #6fbf73 48%, var(--color-background) 52%);
  --notification-background: color-mix(in srgb, var(--color-background) 72%, #6fbf73 28%);
  --notification-shadow: rgba(47, 111, 53, 0.12);
}

.base-notification__icon {
  flex: 0 0 auto;
}

.base-notification__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: color-mix(in srgb, var(--notification-color) 48%, var(--color-background) 52%);
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.base-notification__close:hover,
.base-notification__close:focus-visible {
  background: color-mix(in srgb, var(--notification-color) 8%, transparent);
  color: var(--notification-color);
  outline: none;
}

.base-notification-enter-active,
.base-notification-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.base-notification-enter-from,
.base-notification-leave-to {
  opacity: 0;
  transform: translate(-50%, -1rem);
}
</style>
