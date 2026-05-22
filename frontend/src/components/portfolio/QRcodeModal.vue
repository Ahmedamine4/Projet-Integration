<script setup>
import CloseButton from '@/components/common/CloseButton.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>

<template>
  <Transition name="pop-up">
    <div class="modal-overlay" v-if="open">
      <div class="modal">
        <div class="modal__header">
          <div class="close-button">
            <CloseButton @click="close" />
          </div>
          <h3>{{ title }}</h3>
        </div>

        <div class="modal__body">
          <slot />
        </div>

        <div class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(var(--color-primary-rgb), 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal {
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  max-height: min(32rem, 90vh);
  width: min(32rem, 100%);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.modal__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.close-button {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
}

.modal__header > h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  margin: 0;
}

.modal__body {
  padding: 0.75rem 1.8rem;
  min-height: 20rem;
  overflow: auto;
}

.modal__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  background-color: var(--color-background);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

/* Pop-up transition */
.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity var(--transition-normal);
}

.pop-up-enter-to,
.pop-up-leave-from {
  opacity: 1;
}

.pop-up-enter-from .modal,
.pop-up-leave-to .modal {
  transform: scale(0.97);
}

.pop-up-enter-active .modal,
.pop-up-leave-active .modal {
  transition: transform 0.4s var(--ease-overshoot);
}

.pop-up-enter-to .modal,
.pop-up-leave-from .modal {
  transform: scale(1);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    width: 100%;
    align-self: end;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}

@media (max-width: 480px) {
  .modal__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>