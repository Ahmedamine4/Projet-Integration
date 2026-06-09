<script setup>
import { AlertTriangle } from 'lucide-vue-next';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm action',
  },
  message: {
    type: String,
    default: 'Are you sure you want to continue?',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['cancel', 'confirm']);
</script>

<template>
  <Transition name="confirm-dialog">
    <div
      v-if="open"
      class="confirm-dialog"
      role="presentation"
      @click.self="emit('cancel')"
    >
      <section
        class="confirm-dialog__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${$attrs.id || 'confirm-dialog'}-title`"
      >
        <header class="confirm-dialog__header">
          <span class="confirm-dialog__icon">
            <AlertTriangle :size="22" />
          </span>
          <div>
            <h2 :id="`${$attrs.id || 'confirm-dialog'}-title`">
              {{ title }}
            </h2>
            <p>{{ message }}</p>
          </div>
          <CloseButton
            class="confirm-dialog__close"
            @click="emit('cancel')"
          />
        </header>

        <footer class="confirm-dialog__footer">
          <BaseButton
            type="button"
            variant="ghost"
            size="sm"
            :disabled="loading"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </BaseButton>
          <BaseButton
            type="button"
            variant="submit"
            size="sm"
            class="confirm-dialog__confirm"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </BaseButton>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.confirm-dialog {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.28);
  backdrop-filter: blur(4px);
}

.confirm-dialog__panel {
  width: min(100%, 26rem);
  padding: 1.15rem;
  border: 1px solid rgba(var(--color-error-rgb), 0.16);
  border-radius: 0.85rem;
  background: var(--color-background);
  box-shadow: 0 1.5rem 4rem rgba(var(--color-primary-rgb), 0.22);
}

.confirm-dialog__header {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: flex-start;
}

.confirm-dialog__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error);
}

.confirm-dialog__header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-md);
  line-height: 1.25;
}

.confirm-dialog__header p {
  margin: 0.35rem 0 0;
  color: color-mix(in srgb, var(--color-primary) 68%, var(--color-background) 32%);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.confirm-dialog__close {
  margin-top: 0.15rem;
}

.confirm-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.confirm-dialog__confirm {
  background: var(--color-error);
  box-shadow: 0 12px 24px rgba(var(--color-error-rgb), 0.22);
}

.confirm-dialog__confirm:hover:not(:disabled),
.confirm-dialog__confirm:focus-visible {
  background: color-mix(in srgb, var(--color-error) 88%, white);
}

.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.18s ease;
}

.confirm-dialog-enter-active .confirm-dialog__panel,
.confirm-dialog-leave-active .confirm-dialog__panel {
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-from .confirm-dialog__panel,
.confirm-dialog-leave-to .confirm-dialog__panel {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.98);
}

@media (max-width: 480px) {
  .confirm-dialog__panel {
    width: 100%;
  }
}
</style>
